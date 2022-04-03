import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { Brackets, FindOneOptions, In, Repository } from 'typeorm'

import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { Entity, FieldType, RelateType } from 'src/module/module.entity'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'

import { Task } from './task.entity'

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

    @InjectRepository(Entity)
    private entityRepo: Repository<Entity>,

    private readonly utilService: UtilService,
    private readonly payloadService: PayloadService,
  ) {}

  async addTask({ entityIds, ...dto }: DTO.Task.AddTask) {
    const [task, entities] = await Promise.all([
      this.taskRepo.save(dto),
      this.entityRepo.find({
        where: { id: In(entityIds) },
      }),
    ])

    entities.forEach((entity) => {
      const taskField = entity.module.meta.find(
        (field) =>
          field.type === FieldType.RELATION && field.relateTo === 'task',
      )

      if (!taskField) return
      if (taskField.relateType === RelateType.SINGLE) {
        entity.data[taskField.name] = task.id
        return
      }

      entity.data[taskField.name] = [
        ...((entity.data[taskField.name] || []) as string[]),
        task.id,
      ]
    })

    await this.entityRepo.save(entities)
    return task
  }

  async getTaskOfEntity(id: string) {
    const entity = await this.entityRepo.findOne({ where: { id } })
    const taskField = entity.module.meta.find(
      ({ type, relateTo }) =>
        type === FieldType.RELATION && relateTo === 'task',
    )

    if (!taskField) return []
    const ids = entity.data[taskField.name]

    return this.taskRepo.find({
      where: { id: In([ids].flat()) },
      loadEagerRelations: false,
    })
  }

  async getTaskById(option: FindOneOptions<Task>) {
    const task = await this.taskRepo.findOne(option)

    if (!task) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Task not found`)
    }

    if (
      !this.utilService.checkRoleAction(Actions.IS_ADMIN) &&
      !this.utilService.checkOwnership(task) &&
      !this.utilService.checkRoleAction(Actions.VIEW_ALL_TASK_DETAILS) &&
      !this.utilService.checkRoleAction(Actions.VIEW_AND_EDIT_ALL_TASK_DETAILS)
    ) {
      throw new ForbiddenException()
    }

    return task
  }

  getManyRaw() {
    return this.taskRepo.find({
      select: ['id', 'name'],
      loadEagerRelations: false,
    })
  }

  async getMany(query: DTO.Task.GetManyQuery) {
    let q = this.taskRepo
      .createQueryBuilder('t')
      .leftJoin('t.owner', 'owner')
      .addSelect(['owner.name', 'owner.email'])
      .orderBy('t.createdAt', 'DESC')

    if (!this.utilService.checkRoleAction(Actions.VIEW_ALL_ACCOUNTS)) {
      q.andWhere('owner.id = :ownerId', {
        ownerId: this.payloadService.data.id,
      })
    }

    if (query.priority)
      q.andWhere('t.priority IN (:...priority)', { priority: query.priority })

    if (query.status)
      q.andWhere('t.status IN (:...status)', { status: query.status })

    if (query.search) {
      q = q.andWhere(
        new Brackets((qb) =>
          qb.andWhere('t.name ILIKE :name', {
            name: `%${query.search}%`,
          }),
        ),
      )
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async update(id: string, dto: DTO.Task.UpdateBody) {}

  async batchDelete(ids: string[]) {
    const tasks = await this.taskRepo.find({ where: { id: In(ids) } })
    return this.taskRepo.softRemove(tasks)
  }
}
