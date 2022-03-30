import {
  BadRequestException,
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
import { ModuleName } from 'src/module/default.entity'
import { ModuleService } from 'src/module/module.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { UserService } from 'src/user/user.service'

import { Task } from './task.entity'

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    private readonly userService: UserService,
    private readonly utilService: UtilService,
    private readonly payloadService: PayloadService,
    private readonly moduleService: ModuleService,
  ) {}

  async addTask(dto: DTO.Task.AddTask) {
    await this.userService.getOneUserById({ where: { id: dto.ownerId } })

    if (dto.leadContactId) {
      const leadContactEntity = await this.moduleService.getOneEntity(
        dto.leadContactId,
      )

      const leadContactModule = leadContactEntity.module

      if (leadContactModule.name === ModuleName.LEAD) {
        dto.dealAccountId = null
      } else if (leadContactModule.name !== ModuleName.CONTACT) {
        throw new BadRequestException('Lead or contact not found')
      }
    }

    if (dto.dealAccountId) {
      const dealAccountEntity = await this.moduleService.getOneEntity(
        dto.dealAccountId,
      )

      const dealAccountModule = dealAccountEntity.module
      if (
        dealAccountModule.name !== ModuleName.DEAL &&
        dealAccountModule.name !== ModuleName.ACCOUNT
      ) {
        throw new BadRequestException('Deal or account not found')
      }
    }

    return this.taskRepo.save(dto)
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
      select: ['id', 'subject'],
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
          qb.andWhere('t.subject ILIKE :subject', {
            subject: `%${query.search}%`,
          }),
        ),
      )
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async update(id: string, dto: DTO.Task.UpdateBody) {
    const task = await this.getTaskById({ where: { id } })
    if (
      !this.utilService.checkRoleAction(Actions.IS_ADMIN) &&
      !this.utilService.checkOwnership(task) &&
      !this.utilService.checkRoleAction(Actions.VIEW_AND_EDIT_ALL_TASK_DETAILS)
    ) {
      throw new ForbiddenException()
    }
    await this.userService.getOneUserById({ where: { id: dto.ownerId } })

    if (dto.leadContactId) {
      const leadContactEntity = await this.moduleService.getOneEntity(
        dto.leadContactId,
      )

      const leadContactModule = leadContactEntity.module

      if (leadContactModule.name === ModuleName.LEAD) {
        dto.dealAccountId = null
      } else if (leadContactModule.name !== ModuleName.CONTACT) {
        throw new BadRequestException('Lead or contact not found')
      }
    }

    if (dto.dealAccountId) {
      const dealAccountEntity = await this.moduleService.getOneEntity(
        dto.dealAccountId,
      )

      const dealAccountModule = dealAccountEntity.module
      if (
        dealAccountModule.name !== ModuleName.DEAL &&
        dealAccountModule.name !== ModuleName.ACCOUNT
      ) {
        throw new BadRequestException('Deal or account not found')
      }
    }

    return this.taskRepo.save({ ...task, ...dto })
  }

  async updateAllTasks(tasks: Task[]) {
    await this.taskRepo.save(tasks)
  }

  async batchDelete(ids: string[]) {
    const tasks = await this.taskRepo.find({ where: { id: In(ids) } })
    return this.taskRepo.softRemove(tasks)
  }
}
