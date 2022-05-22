import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  UnprocessableEntityException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { clone, omit } from 'lodash'
import moment from 'moment'
import { paginate } from 'nestjs-typeorm-paginate'
import { FindOneOptions, In, Repository } from 'typeorm'
import { CsvParser, ParsedData } from 'nest-csv-parser'

import { Action, ActionType } from 'src/action/action.entity'
import { DealStage, DealStageType } from 'src/deal-stage/deal-stage.entity'
import { File } from 'src/file/file.entity'
import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { Note } from 'src/note/note.entity'
import { DTO } from 'src/type'

import { account, contact, deal, lead } from './default.entity'
import {
  Entity,
  FieldType,
  Module,
  ReportType,
  TimeFieldType,
} from './module.entity'
import { AuthRequest } from 'src/utils/interface'
import { Duplex } from 'stream'

@Injectable()
export class ModuleService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Module) private moduleRepo: Repository<Module>,
    @InjectRepository(Note) private noteRepo: Repository<Note>,
    @InjectRepository(Entity) private entityRepo: Repository<Entity>,
    @InjectRepository(File) private fileRepo: Repository<File>,
    @InjectRepository(Action) private actionRepo: Repository<Action>,
    @InjectRepository(DealStage) private dealStageRepo: Repository<DealStage>,
    private readonly utilService: UtilService,
    private readonly payloadService: PayloadService,
    private readonly csvParser: CsvParser,

  ) {}

  async onApplicationBootstrap() {
    await this.initDefaultModules()
  }

  private async initDefaultModules() {
    if (process.env.NODE_ENV === 'production') return
    const modules = await this.moduleRepo.find()
    // if (modules.length > 0) return

    return this.moduleRepo.upsert([lead, deal, account, contact], {
      conflictPaths: ['name'],
      skipUpdateIfNoValuesChanged: true,
    })
  }

  getManyModule() {
    return this.moduleRepo.find()
  }

  async createModule(dto: DTO.Module.CreateModule) {
    const module = await this.moduleRepo.findOne({
      where: { name: dto.name },
    })

    if (module) {
      throw new BadRequestException('Module already exists')
    }

    await this.actionRepo.save([
      {
        target: dto.name,
        type: ActionType.CAN_CREATE_NEW,
      },
      {
        target: dto.name,
        type: ActionType.CAN_DELETE_ANY,
      },
      {
        target: dto.name,
        type: ActionType.CAN_VIEW_ALL,
      },
      {
        target: dto.name,
        type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
      },
      {
        target: dto.name,
        type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
      },
    ])

    return this.moduleRepo.save(dto)
  }

  async bulkCreateEntities(
    filBuffer: Buffer,
    moduleName: string,
    req: AuthRequest,
  ) {
    if (
      !this.utilService.checkRoleAction({
        target: moduleName,
        type: ActionType.CAN_IMPORT_FROM_FILE,
      })
    ) {
      throw new ForbiddenException()
    }

    const module = await this.moduleRepo.findOne({
      where: { name: moduleName },
    })

    if (!module) throw new BadRequestException('Module not found')

    const stream = bufferToStream(filBuffer)

    let rawEntities = (await this.csvParser.parse(
      stream,
      DTO.Module.AddEntity,
      undefined,
      undefined,
      { strict: true, separator: ',' },
    )) as ParsedData<DTO.Module.AddEntity>

    let entities: DTO.Module.AddEntity[] = rawEntities.list.map((e: DTO.Module.AddEntity) => ({
      name: e.name,
      data: {
        ...e.data,
        "ownerId": "d6f45054-cc44-4ade-9b6e-0369888e1c91"
      }
    }))

    entities.forEach(e => {
      const validateMessage = module.validateEntity(e.data)
      if (validateMessage) throw new UnprocessableEntityException(validateMessage)
    })

    return this.entityRepo.save({ ...entities, moduleId: module.id })
  }


  async getOneModule(id: string) {
    const module = await this.moduleRepo.findOne({
      where: { id },
    })

    if (!module) throw new NotFoundException('Module not found')
    return module
  }

  async updateModule(id: string, dto: DTO.Module.UpdateModule) {
    const module = await this.getOneModule(id)

    return this.moduleRepo.save({ ...module, ...dto })
  }

  async addEntity(moduleName: string, dto: DTO.Module.AddEntity) {
    if (
      !this.utilService.checkRoleAction({
        target: moduleName,
        type: ActionType.CAN_CREATE_NEW,
      })
    ) {
      throw new ForbiddenException()
    }

    const module = await this.moduleRepo.findOne({
      where: { name: moduleName },
    })

    if (!module) throw new BadRequestException('Module not found')
    const validateMessage = module.validateEntity(dto.data)

    if (validateMessage) throw new UnprocessableEntityException(validateMessage)
    return this.entityRepo.save({ ...dto, moduleId: module.id })
  }

  async convert(
    targetModuleName: string,
    sourceId: string,
    dto: Record<string, any>,
  ) {
    const [targetModule, sourceEntity] = await Promise.all([
      this.moduleRepo.findOne({ where: { name: targetModuleName } }),
      this.entityRepo.findOne({ where: { id: sourceId } }),
    ])

    if (!targetModule) throw new NotFoundException('Module not exist')
    if (!sourceEntity) throw new NotFoundException('Entity not exist')

    const meta = targetModule.convert_meta.find(
      (meta) => meta.source === sourceEntity.module.name,
    )

    if (!meta) {
      throw new BadRequestException(
        `${targetModuleName} can not be converted from ${sourceEntity.module.name}`,
      )
    }

    let targetEntity = new Entity()
    targetEntity.moduleId = targetModule.id
    targetEntity.name = `${sourceEntity.name} ${targetModule.name}`
    targetEntity.data = {}

    Object.entries(meta.meta)
      .filter(([_, targetProp]) =>
        targetModule.meta.some((field) => field.name === targetProp),
      )
      .forEach(([sourceProp, targetProp]) => {
        targetEntity.data[targetProp] = sourceEntity.data[sourceProp]
      })

    Object.entries(dto)
      .filter(([_, targetProp]) =>
        targetModule.meta.some((field) => field.name === targetProp),
      )
      .forEach(([key, value]) => {
        targetEntity.data[key] = value
      })

    const error = targetModule.validateEntity(targetEntity.data)
    if (error) {
      throw new UnprocessableEntityException(`Convert error: ${error}`)
    }

    targetEntity = await this.entityRepo.save(targetEntity)

    if (meta.should_convert_note) {
      let notes = await this.noteRepo.find({
        where: { entityId: sourceEntity.id },
      })

      // @ts-ignore
      notes = notes.map((note) => clone(omit(note, ['id'])))
      await this.noteRepo.save(notes)
    }

    if (meta.should_convert_attachment) {
      let files = await this.fileRepo.find({
        where: { entityId: sourceEntity.id },
      })

      // @ts-ignore
      files = files.map((file) => clone(omit(file, ['id'])))
      await this.fileRepo.save(files)
    }

    await this.entityRepo.softDelete({ id: sourceEntity.id })

    return this.entityRepo.findOne({
      where: { id: targetEntity.id },
      relations: ['module'],
    })
  }

  batchConvert(dtos: DTO.Module.BatchConvert[], sourceId: string) {
    return Promise.all(
      dtos.map(({ dto, module_name }) =>
        this.convert(module_name, sourceId, dto),
      ),
    )
  }

  getConvertableModules(sourceModuleName: string) {
    const qb = this.moduleRepo
      .createQueryBuilder('m')
      .where(
        `jsonb_path_query_array(m.convert_meta, '$[*] ? (@.source == "${sourceModuleName}")') @> :query::jsonb`,
        {
          query: JSON.stringify([{ source: sourceModuleName }]),
        },
      )

    return qb.getMany()
  }

  async getRawEntity(moduleName: string) {
    const module = await this.moduleRepo.findOne({
      where: { name: moduleName },
    })
    if (!module) return new NotFoundException('Module not found')

    return this.entityRepo.find({
      where: { moduleId: module.id },
      select: ['id', 'name'],
      loadEagerRelations: false,
    })
  }

  getRawEntityForTaskCreate() {
    const qb = this.entityRepo
      .createQueryBuilder('e')
      .leftJoin('e.module', 'module')
      .where(
        `jsonb_path_query_array(module.meta, '$[*] ? (@.type == "${FieldType.RELATION}")') @> :query::jsonb`,
        {
          query: JSON.stringify([{ type: FieldType.RELATION }]),
        },
      )
      .andWhere(
        `jsonb_path_query_array(module.meta, '$[*] ? (@.relateTo == "task")') @> :query::jsonb`,
        {
          query: JSON.stringify([{ relateTo: 'task' }]),
        },
      )
      .select(['e.id', 'e.name'])
      .addSelect(['module.id', 'module.name'])

    return qb.getMany()
  }

  getManyDealByStageId(stageId: string) {
    const qb = this.entityRepo
      .createQueryBuilder('e')
      .leftJoin('e.module', 'module')
      .where(
        `jsonb_path_query_array(e.data, '$[*] ? (@.stageId == "${stageId}")') @> :query::jsonb`,
        {
          query: JSON.stringify([{ stageId: stageId }]),
        },
      )
      .select(['e.id', 'e.name'])
      .addSelect(['module.id', 'module.name'])

    return qb.getMany()
  }

  async getManyEntity(
    moduleName: string,
    { limit, page, shouldNotPaginate, ...dto }: DTO.Module.GetManyEntity,
  ) {
    const module = await this.moduleRepo.findOne({
      where: { name: moduleName },
    })

    if (!module) throw new BadRequestException('Module not existed')
    let qb = this.entityRepo
      .createQueryBuilder('e')
      .leftJoin('e.module', 'module')
      .orderBy('e.createdAt', 'DESC')
      .andWhere('module.name = :name', { name: moduleName })

    if (
      !this.utilService.checkRoleAction({
        target: moduleName,
        type: ActionType.CAN_VIEW_ALL,
      })
    ) {
      qb.andWhere("e.data ->> 'ownerId' = :ownerId", {
        ownerId: this.payloadService.data.id,
      })
    }

    module.meta
      .filter((field) => field.type === FieldType.SELECT && !!dto[field.name])
      .forEach(({ name }, index) => {
        qb = qb.andWhere(`e.data ->> '${name}' IN (:...options${index})`, {
          ['options' + index]: [dto[name]].flat(),
        })
      })

    if (dto.search) {
      qb = qb.andWhere('to_tsvector(e.name) @@ plainto_tsquery(:search)', {
        search: dto.search,
      })
    }

    if (shouldNotPaginate) return qb.getMany()
    return paginate(qb, { limit, page })
  }

  async getOneEntity(moduleName: string, id: string) {
    const entity = await this.entityRepo.findOne({
      join: {
        alias: 'e',
        leftJoinAndSelect: {
          module: 'e.module',
        },
      },
      where: {
        id,
        module: {
          name: moduleName,
        },
      },
    })

    if (!entity) throw new NotFoundException('Entity not found')

    if (
      !this.utilService.checkOwnershipEntity(entity) &&
      !this.utilService.checkRoleAction({
        target: moduleName,
        type: ActionType.CAN_VIEW_ALL,
      }) &&
      !this.utilService.checkRoleAction({
        target: moduleName,
        type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
      })
    ) {
      throw new ForbiddenException()
    }
    return entity
  }

  async updateEntity(id: string, dto: DTO.Module.UpdateEnity) {
    const entity = await this.entityRepo.findOne({ where: { id } })
    if (!entity) throw new BadRequestException('Entity not found')

    const module = entity.module
    const validateMsg = module.validateEntity(dto.data)

    if (validateMsg) throw new UnprocessableEntityException(validateMsg)

    if (
      !this.utilService.checkOwnershipEntity(entity) &&
      !this.utilService.checkRoleAction({
        target: module.name,
        type: ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
      })
    ) {
      throw new ForbiddenException()
    }

    return this.entityRepo.save({ ...entity, ...dto })
  }

  async batchDeleteEntity(dto: DTO.BatchDelete) {
    const entities = await this.entityRepo.find({ where: { id: In(dto.ids) } })
    if (entities) {
      if (
        !this.utilService.checkRoleAction({
          target: entities[0].module.name,
          type: ActionType.CAN_DELETE_ANY,
        })
      ) {
        throw new ForbiddenException()
      }

      return this.entityRepo.softRemove(entities)
    }
  }

  async getEntityById(option: FindOneOptions<Entity>) {
    const entity = await this.entityRepo.findOne(option)

    if (!entity) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Entity not found`)
    }

    return entity
  }

  async getManyDealStagesByType(type: DealStageType) {
    return this.dealStageRepo
      .createQueryBuilder('e')
      .where('e.type = :type', { type: type })
      .getMany()
  }

  async getReport(filterDto: DTO.Module.DealReportFilter) {
    switch (filterDto.reportType) {
      case ReportType.TODAY_SALES:
      case ReportType.THIS_MONTH_SALES:
      case ReportType.SALES_BY_LEAD_SOURCE:
      case ReportType.SALES_PERSON_PERFORMANCE:
        return this.getDealsReport(DealStageType.CLOSE_WON, filterDto)
      case ReportType.OPEN_DEALS:
      case ReportType.DEALS_CLOSING_THIS_MONTH:
      case ReportType.PIPELINE_BY_PROBABILITY:
      case ReportType.PIPELINE_BY_STAGE:
        return this.getDealsReport(DealStageType.OPEN, filterDto)
      case ReportType.LOST_DEALS:
        return this.getDealsReport(DealStageType.CLOSE_LOST, filterDto)
      default:
        throw new BadRequestException(
          `Cannot find report with type ${filterDto.reportType}`,
        )
    }
  }

  async getDealsReport(
    dealStageType: DealStageType,
    {
      limit,
      page,
      shouldNotPaginate,
      ...filterDto
    }: DTO.Module.DealReportFilter,
  ) {
    const ids = []
    const dealStages = await this.getManyDealStagesByType(dealStageType)
    dealStages.forEach(({ id }) => ids.push(id))

    const qb = this.entityRepo
      .createQueryBuilder('e')
      .where("e.data ->> 'stageId' IN (:...ids)", { ids: ids })

    switch (filterDto.timeFieldType) {
      case TimeFieldType.EXACT: {
        qb.andWhere(
          `e.data ->> '${filterDto.timeFieldName}' = '${moment(
            filterDto.singleDate,
          ).format('YYYY-MM-DD')}'`,
        )
        break
      }

      case TimeFieldType.BETWEEN: {
        qb.andWhere(
          `e.data ->> '${filterDto.timeFieldName}' >= '${moment(
            filterDto.startDate,
          ).format('YYYY-MM-DD')}'`,
        )
        qb.andWhere(
          `e.data ->> '${filterDto.timeFieldName}' <= '${moment(
            filterDto.endDate,
          ).format('YYYY-MM-DD')}'`,
        )
        break
      }

      case TimeFieldType.IS_AFTER: {
        qb.andWhere(
          `e.data ->> '${filterDto.timeFieldName}' >= '${moment(
            filterDto.singleDate,
          ).format('YYYY-MM-DD')}'`,
        )
        break
      }

      case TimeFieldType.IS_BEFORE: {
        qb.andWhere(
          `e.data ->> '${filterDto.timeFieldName}' <= '${moment(
            filterDto.singleDate,
          ).format('YYYY-MM-DD')}'`,
        )
        break
      }

      default:
        break
    }

    if (filterDto.reportType === ReportType.SALES_BY_LEAD_SOURCE) {
      qb.groupBy(`e.data ->> 'source', e.id`)
      qb.orderBy(`e.data ->> 'source', e.createdAt`, 'DESC')
    } else if (filterDto.reportType === ReportType.SALES_PERSON_PERFORMANCE) {
      qb.groupBy(`e.data ->> 'ownerId', e.id`)
      qb.orderBy(`e.data ->> 'ownerId', e.createdAt`, 'DESC')
    } else if (filterDto.reportType === ReportType.PIPELINE_BY_PROBABILITY) {
      qb.groupBy(`e.data ->> 'probability', e.id`)
      qb.orderBy(`e.data ->> 'probability', e.createdAt`, 'DESC')
    } else if (filterDto.reportType === ReportType.PIPELINE_BY_STAGE) {
      qb.groupBy(`e.data ->> 'stageId', e.id`)
      qb.orderBy(`e.data ->> 'stageId', e.createdAt`, 'DESC')
    } else {
      qb.orderBy('e.createdAt', 'DESC')
    }

    if (shouldNotPaginate) return qb.getMany()
    return paginate(qb, { limit, page })
  }
}


function bufferToStream(buffer: Buffer) {
  // Remove BOM in buffer
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf)
    buffer = buffer.slice(3)

  let duplexStream = new Duplex({ encoding: 'utf-8' })
  duplexStream.push(buffer)
  duplexStream.push(null)
  return duplexStream
}