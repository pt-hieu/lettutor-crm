import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { ContactService } from 'src/contact/contact.service'
import { DealService } from 'src/deal/deal.service'
import { LeadService } from 'src/lead/lead.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { UserService } from 'src/user/user.service'
import { JwtPayload } from 'src/utils/interface'
import { Brackets, FindOneOptions, Repository } from 'typeorm'
import { Task, TaskStatus } from './task.entity'

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly contactService: ContactService,
    @Inject(forwardRef(() => LeadService))
    private readonly leadService: LeadService,
    private readonly dealService: DealService,
  ) { }

  async addTask(dto: DTO.Task.AddTask) {
    await this.userService.getOneUserById({ where: { id: dto.ownerId } })

    if (dto.leadId) {
      await this.leadService.getLeadById({
        where: { id: dto.leadId },
      })
      dto.accountId = null
      dto.contactId = null
      dto.dealId = null
    } else if (dto.contactId) {
      dto.leadId = null

      if (dto.accountId) {
        dto.dealId = null
      } else if (dto.dealId) {
        dto.accountId = null
      }

      await Promise.all([
        this.contactService.getContactById({
          where: { id: dto.contactId },
        }),
        dto.accountId
          ? this.accountService.getAccountById({ where: { id: dto.accountId } })
          : undefined,
        dto.dealId
          ? this.dealService.getDealById({ where: { id: dto.dealId } })
          : undefined,
      ])
    }

    return this.taskRepo.save(dto)
  }

  async getTaskById(option: FindOneOptions<Task>) {
    const task = await this.taskRepo.findOne(option)

    if (!task) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Task not found`)
    }

    return task
  }

  async getMany(query: DTO.Task.GetManyQuery, payload: JwtPayload) {
    let q = this.taskRepo
      .createQueryBuilder('t')
      .leftJoin('t.owner', 'owner')
      .leftJoin('t.lead', 'lead')
      .leftJoin('t.account', 'account')
      .leftJoin('t.deal', 'deal')
      .addSelect([
        'owner.name',
        'owner.email',
        'lead.fullName',
        'account.fullName',
        'deal.fullName',
      ])

    if (
      !payload.roles.some(({ actions }) => actions.includes(Actions.IS_ADMIN))
    )
      q.where('t.ownerId = :ownerId', { ownerId: payload.id })

    if (query.isOpen)
      q.andWhere('t.status != :completed', { completed: TaskStatus.COMPLETED })

    if (query.priority)
      q.andWhere('t.priority IN (:...priority)', { priority: query.priority })

    if (!query.isOpen && query.status)
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

    await this.userService.getOneUserById({ where: { id: dto.ownerId } })

    if (dto.leadId) {
      await this.leadService.getLeadById({
        where: { id: dto.leadId },
      })
      dto.contactId = null
      dto.accountId = null
      dto.dealId = null
      return this.taskRepo.save({ ...task, ...dto })
    }

    if (dto.contactId) {
      dto.leadId = null
      dto.accountId
        ? (dto.dealId = null)
        : dto.dealId
          ? (dto.accountId = null)
          : undefined
    }

    await Promise.all([
      dto.contactId
        ? this.contactService.getContactById({
          where: { id: dto.contactId },
        })
        : undefined,
      dto.accountId
        ? this.accountService.getAccountById({ where: { id: dto.accountId } })
        : undefined,
      dto.dealId
        ? this.dealService.getDealById({ where: { id: dto.dealId } })
        : undefined,
    ])

    return this.taskRepo.save({ ...task, ...dto })
  }

  async updateAllTasks(tasks: Task[]) {
    await this.taskRepo.save(tasks)
  }

  async
}
