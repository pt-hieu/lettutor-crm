import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
  UnprocessableEntityException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { In, Repository } from 'typeorm'

import { DTO } from 'src/type'

import { account, contact, deal, lead } from './default.entity'
import { Entity, Module } from './module.entity'

@Injectable()
export class ModuleService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Module) private moduleRepo: Repository<Module>,
    @InjectRepository(Entity) private entityRepo: Repository<Entity>,
  ) {}

  async onApplicationBootstrap() {
    this.initDefaultModules()
  }

  private initDefaultModules() {
    return this.moduleRepo.upsert([lead, deal, account, contact], {
      conflictPaths: ['name'],
      skipUpdateIfNoValuesChanged: true,
    })
  }

  getManyModule() {
    return this.moduleRepo.find()
  }

  createModule(dto: DTO.Module.CreateModule) {
    return this.moduleRepo.save(dto)
  }

  async updateModule(id: string, dto: DTO.Module.UpdateModule) {
    const module = await this.moduleRepo.findOne({ where: { id } })
    if (!module) throw new BadRequestException('Module not found')

    return this.moduleRepo.save({ ...module, ...dto })
  }

  async addEntity(moduleName: string, dto: DTO.Module.AddEntity) {
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

  async getManyEntity(
    moduleName: string,
    { limit, page, shouldNotPaginate }: DTO.Module.GetManyEntity,
  ) {
    let qb = this.entityRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.module', 'module')
      .orderBy('e.createdAt', 'DESC')
      .andWhere('module.name = :name', { name: moduleName })

    if (shouldNotPaginate) return qb.getMany()
    return paginate(qb, { limit, page })
  }

  async getOneEntity(moduleName: string, id: string) {
    const entity = await this.entityRepo.findOne({
      join: {
        alias: 'entity',
        leftJoinAndSelect: {
          module: 'entity.module',
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
    return entity
  }

  async updateEntity(id: string, dto: DTO.Module.AddEntity) {
    const entity = await this.entityRepo.findOne({ where: { id } })
    if (!entity) throw new BadRequestException('Entity not found')

    const module = entity.module
    const validateMsg = module.validateEntity(dto.data)

    if (validateMsg) throw new UnprocessableEntityException(validateMsg)
    return this.entityRepo.save({ ...entity, ...dto })
  }

  async batchDeleteEntity(dto: DTO.BatchDelete) {
    const entities = await this.entityRepo.find({ where: { id: In(dto.ids) } })
    return this.entityRepo.softRemove(entities)
  }
}
