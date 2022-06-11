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
import { parseAsync } from 'json2csv'
import { clone, omit } from 'lodash'
import moment from 'moment'
import { CsvParser, ParsedData } from 'nest-csv-parser'
import { paginate } from 'nestjs-typeorm-paginate'
import { Duplex } from 'stream'
import { FindOneOptions, In, Repository } from 'typeorm'

import { Action, ActionType } from 'src/action/action.entity'
import { DealStage, DealStageType } from 'src/deal-stage/deal-stage.entity'
import { File, FileExtension } from 'src/file/file.entity'
import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { Note } from 'src/note/note.entity'
import { DTO } from 'src/type'
import { UserService } from 'src/user/user.service'
import * as xlsx from 'xlsx';

import { LeadSource, account, contact, deal, lead } from './default.entity'
import {
  Entity,
  FieldType,
  Module,
  ReportType,
  TimeFieldName,
  TimeFieldType,
} from './module.entity'

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
    private readonly userService: UserService,
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
        type: ActionType.CAN_VIEW_DETAIL_ANY,
      },
    ])

    return this.moduleRepo.save(dto)
  }

  async getTemplateForCreatingModuule(moduleName: string) {
    const csv = await parseAsync(
      {
        name: moduleName,
      },
      { fields: ['name', 'phone', 'email', 'status'] },
    )

    return csv
  }

  async getListInCsvFormat(moduleName: string) {
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
    let entities = await qb.getMany()
    const rawData = entities.map((e) => ({
      name: e.name,
      email: e.data['email'],
      phone: e.data['phone'],
      source: e.data['source'],
      status: e.data['status'],
      created_at: e.createdAt,
    }))

    const csv = await parseAsync(rawData, {
      fields: ['name', 'email', 'phone', 'source', 'created_at'],
    })

    return csv
  }

  async bulkCreateEntities(moduleName: string, dto: DTO.File.Files) {
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
    const file = dto.files[0]
    let filenameArr = file.name.split(".")
    let fileEtx = filenameArr[filenameArr.length - 1]


    let entities: DTO.Module.AddEntity[]
    let rawEntities: DTO.Module.AddEntityFromFile[] = new Array()

    if(fileEtx == FileExtension.XLSX){
      const buffer = Buffer.from(file.buffer, 'base64')
      const wb = xlsx.read(buffer, { type: 'buffer' });
      const sheet: xlsx.WorkSheet = wb.Sheets[wb.SheetNames[0]];
      const range = xlsx.utils.decode_range(sheet['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        if (R === 0 || R=== 1|| !sheet[xlsx.utils.encode_cell({ c: 0, r: R })]) {
          continue;
        }
     
        let col = 0;
        const entity = {
          name: sheet[xlsx.utils.encode_cell({ c: col++, r: R })]?.v,
          phone: sheet[xlsx.utils.encode_cell({ c: col++, r: R })]?.v,
          email: sheet[xlsx.utils.encode_cell({ c: col++, r: R })]?.v,
          status: sheet[xlsx.utils.encode_cell({ c: col++, r: R })]?.v,
        }
        rawEntities.push(entity)
      }
    } else if (fileEtx == FileExtension.CSV) {
      const stream = bufferToStream(Buffer.from(file.buffer, 'base64'))

      const moduleData = (await this.csvParser.parse(
        stream,
        DTO.Module.AddEntityFromFile,
        undefined,
        undefined,
        { strict: true, separator: ',' },
      )) as ParsedData<DTO.Module.AddEntityFromFile>
      rawEntities = moduleData.list
    }

    const users = await this.userService.getManyRaw()

    entities = rawEntities.map(
      (e: DTO.Module.AddEntityFromFile) => {
        let entity: Record<string, unknown> = JSON.parse(JSON.stringify(e))
        let randomIdx = generateRandom(0, users.length - 1)
        entity['source'] = LeadSource.NONE
        entity['ownerId'] = users[randomIdx].id
        delete entity['name']
        return {
          name: moduleName,
          data: entity,
        }
      },
    )

    entities.forEach((e) => {
      const validateMessage = module.validateEntity(e.data)
      if (validateMessage)
        throw new UnprocessableEntityException(validateMessage)
    })

    return this.entityRepo.save(
      entities.map((e) => ({
        name: e.name,
        data: e.data,
        moduleId: module.id,
      })),
    )
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
    sourceEntity: Entity,
    targetModuleName: string,
    dto: Record<string, any>,
    options: { useEntity: boolean; availableModules: string[] },
  ) {
    const targetModule = await this.moduleRepo.findOne({
      where: { name: targetModuleName },
    })

    if (!targetModule) throw new NotFoundException('Module not exist')

    const meta = targetModule.convert_meta.find(
      (meta) => meta.source === sourceEntity.module.name,
    )

    if (!meta) {
      throw new BadRequestException(
        `${targetModuleName} can not be converted from ${sourceEntity.module.name}`,
      )
    }

    let targetEntity = new Entity()
    targetEntity.name = `[${
      targetModule.name.charAt(0).toUpperCase() + targetModule.name.slice(1)
    }] ${sourceEntity.name}`
    targetEntity.data = {}
    targetEntity.moduleId = targetModule.id

    Object.entries(meta.meta)
      .filter(([_, targetProp]) =>
        targetModule.meta.some((field) => field.name === targetProp),
      )
      .forEach(([sourceProp, targetProp]) => {
        targetEntity.data[targetProp] = sourceEntity.data[sourceProp]
      })

    Object.entries(dto)
      .filter(([targetProp, _]) =>
        targetModule.meta.some((field) => field.name === targetProp),
      )
      .forEach(([key, value]) => {
        targetEntity.data[key] = value
      })

    const error = targetModule.validateEntity(targetEntity.data, {
      availaleModules: options.availableModules,
    })

    if (error) {
      throw new UnprocessableEntityException(`Convert error: ${error}`)
    }

    targetEntity = await this.entityRepo.save(targetEntity)

    if (meta.should_convert_note) {
      let notes = await this.noteRepo.find({
        where: { entityId: sourceEntity.id },
      })

      // @ts-ignore
      notes = notes.map((note) => {
        const result = clone(omit(note, ['id']))
        result.entityId = targetEntity.id

        return result
      })
      await this.noteRepo.save(notes)
    }

    if (meta.should_convert_attachment) {
      let files = await this.fileRepo.find({
        where: { entityId: sourceEntity.id },
      })

      // @ts-ignore
      files = files.map((file) => {
        const result = clone(omit(file, ['id']))
        result.entityId = targetEntity.id

        return result
      })

      await this.fileRepo.save(files)
    }

    sourceEntity.converted_info.push({
      moduleName: targetModule.name,
      entityName: targetEntity.name,
      entityId: targetEntity.id,
    })

    return this.entityRepo.findOne({
      where: { id: targetEntity.id },
      relations: ['module'],
    })
  }

  async batchConvert(dtos: DTO.Module.BatchConvert[], sourceId: string) {
    const sourceEntity = await this.entityRepo.findOne({
      where: { id: sourceId },
    })
    if (!sourceEntity) throw new NotFoundException('Entity not exist')

    const entities = await Promise.all(
      dtos.map(({ dto, module_name, useEntity }) =>
        this.convert(sourceEntity, module_name, dto, {
          useEntity,
          availableModules: dtos.map((d) => d.module_name),
        }),
      ),
    )

    sourceEntity.data['isConverted'] = true

    dtos.forEach(({ useEntity }, index) => {
      if (!useEntity) return

      const entity = entities[index]
      entity.module.meta.forEach((fieldMeta) => {
        if (
          fieldMeta.required &&
          !entity.data[fieldMeta.name] &&
          fieldMeta.type === FieldType.RELATION
        ) {
          entity.data[fieldMeta.name] = entities.find(
            (e) => e.module.name === fieldMeta.relateTo,
          )?.id
        }
      })
    })

    await this.entityRepo.save([sourceEntity, ...entities])
    await this.entityRepo.softDelete({ id: sourceEntity.id })

    return entities
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

  async getReport(filterDto: DTO.Module.ReportFilter) {
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
      case ReportType.TODAY_LEADS:
      case ReportType.LEADS_BY_SOURCE:
      case ReportType.LEADS_BY_STATUS:
      case ReportType.LEADS_BY_OWNERSHIP:
      case ReportType.CONVERTED_LEADS:
        return this.getLeadsReport(filterDto)
      default:
        throw new BadRequestException(
          `Cannot find report with type ${filterDto.reportType}`,
        )
    }
  }

  async getDealsReport(
    dealStageType: DealStageType,
    { limit, page, shouldNotPaginate, ...filterDto }: DTO.Module.ReportFilter,
  ) {
    const ids = []
    const dealStages = await this.getManyDealStagesByType(dealStageType)
    dealStages.forEach(({ id }) => ids.push(id))

    let timeQueryString
    if (filterDto.timeFieldName) {
      timeQueryString =
        filterDto.timeFieldName === TimeFieldName.CLOSING_DATE
          ? `e.data ->> '${filterDto.timeFieldName}'`
          : `e.${filterDto.timeFieldName}::DATE`
    }

    const qb = this.entityRepo
      .createQueryBuilder('e')
      .where("e.data ->> 'stageId' IN (:...ids)", { ids: ids })

    switch (filterDto.timeFieldType) {
      case TimeFieldType.EXACT: {
        qb.andWhere(
          `${timeQueryString} = '${moment(filterDto.singleDate).format(
            'YYYY-MM-DD',
          )}'`,
        )
        break
      }

      case TimeFieldType.BETWEEN: {
        qb.andWhere(
          `${timeQueryString} >= '${moment(filterDto.startDate).format(
            'YYYY-MM-DD',
          )}'`,
        ).andWhere(
          `${timeQueryString} <= '${moment(filterDto.endDate).format(
            'YYYY-MM-DD',
          )}'`,
        )
        break
      }

      case TimeFieldType.IS_AFTER: {
        qb.andWhere(
          `${timeQueryString} >= '${moment(filterDto.singleDate).format(
            'YYYY-MM-DD',
          )}'`,
        )
        break
      }

      case TimeFieldType.IS_BEFORE: {
        qb.andWhere(
          `${timeQueryString} <= '${moment(filterDto.singleDate).format(
            'YYYY-MM-DD',
          )}'`,
        )
        break
      }

      default:
        break
    }

    if (filterDto.reportType === ReportType.SALES_BY_LEAD_SOURCE) {
      qb.groupBy(`e.data ->> 'source', e.id`).orderBy(
        `e.data ->> 'source', e.createdAt`,
        'DESC',
      )
    } else if (filterDto.reportType === ReportType.SALES_PERSON_PERFORMANCE) {
      qb.groupBy(`e.data ->> 'ownerId', e.id`).orderBy(
        `e.data ->> 'ownerId', e.createdAt`,
        'DESC',
      )
    } else if (filterDto.reportType === ReportType.PIPELINE_BY_PROBABILITY) {
      qb.groupBy(`e.data ->> 'probability', e.id`).orderBy(
        `e.data ->> 'probability', e.createdAt`,
        'DESC',
      )
    } else if (filterDto.reportType === ReportType.PIPELINE_BY_STAGE) {
      qb.groupBy(`e.data ->> 'stageId', e.id`).orderBy(
        `e.data ->> 'stageId', e.createdAt`,
        'DESC',
      )
    } else {
      qb.orderBy('e.createdAt', 'DESC')
    }

    if (shouldNotPaginate) return qb.getMany()
    return paginate(qb, { limit, page })
  }

  async getLeadsReport({
    limit,
    page,
    shouldNotPaginate,
    ...filterDto
  }: DTO.Module.ReportFilter) {
    if (filterDto.timeFieldName === TimeFieldName.CLOSING_DATE) {
      throw new BadRequestException(
        'Leads report do not have field closing date ',
      )
    }

    const qb = this.entityRepo
      .createQueryBuilder('e')
      .leftJoin('e.module', 'module')
      .where("module.name = 'lead'")

    switch (filterDto.timeFieldType) {
      case TimeFieldType.EXACT: {
        qb.andWhere(
          `e.${filterDto.timeFieldName}::DATE = '${moment(
            filterDto.singleDate,
          ).format('YYYY-MM-DD')}'`,
        )
        break
      }

      case TimeFieldType.BETWEEN: {
        qb.andWhere(
          `e.${filterDto.timeFieldName}::DATE >= '${moment(
            filterDto.startDate,
          ).format('YYYY-MM-DD')}'`,
        ).andWhere(
          `e.${filterDto.timeFieldName}::DATE <= '${moment(
            filterDto.endDate,
          ).format('YYYY-MM-DD')}'`,
        )
        break
      }

      case TimeFieldType.IS_AFTER: {
        qb.andWhere(
          `e.${filterDto.timeFieldName}::DATE >= '${moment(
            filterDto.singleDate,
          ).format('YYYY-MM-DD')}'`,
        )
        break
      }

      case TimeFieldType.IS_BEFORE: {
        qb.andWhere(
          `e.${filterDto.timeFieldName}::DATE <= '${moment(
            filterDto.singleDate,
          ).format('YYYY-MM-DD')}'`,
        )
        break
      }

      default:
        break
    }

    if (filterDto.reportType === ReportType.LEADS_BY_SOURCE) {
      qb.groupBy(`e.data ->> 'source', e.id`).orderBy(
        `e.data ->> 'source', e.createdAt`,
        'DESC',
      )
    } else if (filterDto.reportType === ReportType.LEADS_BY_STATUS) {
      qb.groupBy(`e.data ->> 'status', e.id`).orderBy(
        `e.data ->> 'status', e.createdAt`,
        'DESC',
      )
    } else if (filterDto.reportType === ReportType.LEADS_BY_OWNERSHIP) {
      qb.groupBy(`e.data ->> 'ownerId', e.id`).orderBy(
        `e.data ->> 'ownerId', e.createdAt`,
        'DESC',
      )
    } else if (filterDto.reportType === ReportType.CONVERTED_LEADS) {
      qb.withDeleted()
        .andWhere(`e.data ->> 'isConverted' = 'true'`)
        .orderBy('e.createdAt', 'DESC')
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

function generateRandom(min: number, max: number) {
  let difference = max - min
  let rand = Math.random()
  rand = Math.floor(rand * difference)
  rand = rand + min
  return rand
}
