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
import { paginate } from 'nestjs-typeorm-paginate'
import { FindOneOptions, In, Repository } from 'typeorm'

import { Action, ActionType } from 'src/action/action.entity'
import { File } from 'src/file/file.entity'
import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { Note } from 'src/note/note.entity'
import { NoteService } from 'src/note/note.service'
import { DTO } from 'src/type'
import { UserService } from 'src/user/user.service'

import { account, contact, deal, lead } from './default.entity'
import { Entity, FieldType, Module } from './module.entity'

@Injectable()
export class ModuleService implements OnApplicationBootstrap {
  constructor(
    private readonly userService: UserService,
    private readonly noteService: NoteService,
    @InjectRepository(Module) private moduleRepo: Repository<Module>,
    @InjectRepository(Note) private noteRepo: Repository<Note>,
    @InjectRepository(Entity) private entityRepo: Repository<Entity>,
    @InjectRepository(File) private fileRepo: Repository<File>,
    @InjectRepository(Action) private actionRepo: Repository<Action>,
    private readonly utilService: UtilService,
    private readonly payloadService: PayloadService,
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
}
