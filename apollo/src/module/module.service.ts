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
import { paginate } from 'nestjs-typeorm-paginate'
import { FindOneOptions, In, Repository } from 'typeorm'

import { Action, ActionType } from 'src/action/action.entity'
import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { Section } from 'src/module-section/module-section.entity'
import { Note } from 'src/note/note.entity'
import { NoteService } from 'src/note/note.service'
import { DTO } from 'src/type'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'

import {
  account,
  account_section,
  contact,
  contact_section,
  deal,
  deal_section,
  lead,
  lead_section,
} from './default.entity'
import { CoLumn, Entity, FieldMeta, FieldType, Module } from './module.entity'

// import { File } from 'src/file/file.entity'

@Injectable()
export class ModuleService implements OnApplicationBootstrap {
  constructor(
    private readonly userService: UserService,
    private readonly noteService: NoteService,
    @InjectRepository(Module) private moduleRepo: Repository<Module>,
    @InjectRepository(Entity) private entityRepo: Repository<Entity>,
    // @InjectRepository(File) private fileRepo: Repository<File>,
    @InjectRepository(Action) private actionRepo: Repository<Action>,
    @InjectRepository(Section) private sectionRepo: Repository<Section>,
    private readonly utilService: UtilService,
    private readonly payloadService: PayloadService,
  ) {}

  async onApplicationBootstrap() {
    await this.initDefaultModules()
    await this.initDefaultSections()
  }

  private async initDefaultModules() {
    if (process.env.NODE_ENV === 'production') return
    const modules = await this.moduleRepo.find()
    if (modules.length > 0) return

    return this.moduleRepo.upsert([lead, deal, account, contact], {
      conflictPaths: ['name'],
      skipUpdateIfNoValuesChanged: true,
    })
  }

  private async initDefaultSections() {
    if (process.env.NODE_ENV === 'production') return
    const sections = await this.sectionRepo.find()
    if (sections.length > 0) return

    this.sectionRepo.upsert(
      [lead_section, deal_section, account_section, contact_section],
      {
        conflictPaths: ['id'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
  }

  async updateDefaultSection(data: Section) {
    const default_module = await this.moduleRepo.findOne({
      where: { name: data.name.split(' ')[0].toLowerCase() },
    })
    if (!default_module) return

    data.moduleId = default_module.id

    return this.sectionRepo.save(data)
  }

  async updateDefaultModule(data: DTO.Module.UpdateModule) {
    const default_module = await this.moduleRepo.findOne({
      where: { name: data.name },
    })
    const Module_Section = await this.sectionRepo.findOne({
      where: {
        name:
          data.name.charAt(0).toUpperCase() +
          data.name.slice(1) +
          ' Information',
      },
    })

    if (!Module_Section) return

    data.meta.forEach((field) => (field.groupId = Module_Section.id))

    return this.moduleRepo.save({ ...default_module, ...data })
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

  async getManyMetaBySection(
    moduleId: string,
    groupId: string,
    column: CoLumn,
  ) {
    const module = await this.getOneModule(moduleId)
    if (!module) return

    const metaForSection: FieldMeta[] = []
    module.meta.forEach((field) => {
      if (field.groupId === groupId && field.column === column) {
        metaForSection.push(field)
      }
    })

    return metaForSection.sort((a, b) => a.order - b.order)
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

  async convert(
    id: string,
    dealDto: DTO.Module.ConvertToDeal,
    shouldConvertToDeal: boolean,
    ownerId: string,
  ) {
    const lead = await this.getEntityById({
      where: { id },
      relations: ['owner', 'tasks', 'tasks.owner'],
    })

    let newOwner: User
    if (ownerId) {
      newOwner = await this.userService.getOneUserById({
        where: { id: ownerId },
      })
    }

    const accountDto: DTO.Module.AddEntity = {
      name: lead.name + ' Account',
      data: {
        ownerId: newOwner
          ? newOwner.id
          : lead.data.ownerId
          ? lead.data.ownerId
          : null,
        phone: lead.data.phone,
        address: lead.data.address ? lead.data.address : null,
        description: lead.data.description ? lead.data.description : null,
        tasks: shouldConvertToDeal ? null : lead.data.tasks,
      },
    }

    const account = await this.addEntity('account', accountDto)

    const contactDto: DTO.Module.AddEntity = {
      name: lead.name,
      data: {
        ownerId: newOwner
          ? newOwner.id
          : lead.data.ownerId
          ? lead.data.ownerId
          : null,
        accountId: account.id,
        phone: lead.data.phone,
        email: lead.data.email,
        source: lead.data.source,
        tasks: lead.data.tasks,
      },
    }

    const contact = await this.addEntity('contact', contactDto)

    let deal: Entity | null = null
    delete dealDto.name
    const { name } = dealDto
    delete dealDto.name
    if (shouldConvertToDeal) {
      const dto: DTO.Module.AddEntity = {
        name,
        data: {
          accountId: account.id,
          contactId: contact.id,
          ownerId: lead.data.ownerId ? lead.data.ownerId : null,
          tasks: lead.data.tasks,
          ...dealDto,
        },
      }

      deal = await this.addEntity('deal', dto)
    }

    const notes: Note[] = lead.notes
    notes.forEach((note) => {
      note.entityId = contact.id
    })

    await this.noteService.updateAllNotes(notes)
    await this.batchDeleteEntity({ ids: [lead.id] })

    return [account, contact, deal] as const
  }
}
