import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AccountService } from 'src/account/account.service'
import { DealService } from 'src/deal/deal.service'
import { ContactService } from 'src/lead-contact/contact.service'
import { LeadService } from 'src/lead-contact/lead.service'
import { DTO } from 'src/type'
import { UserService } from 'src/user/user.service'
import { FindOneOptions, Repository } from 'typeorm'
import { Task } from './task.entity'

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly contactService: ContactService,
    private readonly leadService: LeadService,
    private readonly dealService: DealService,
  ) { }

  async addTask(dto: DTO.Task.AddTask) {
    await this.userService.getOneUserById({ where: { id: dto.ownerId } })

    if (dto.leadId) {
      await this.leadService.getLeadById({ where: { id: dto.leadId } })
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
        this.contactService.getContactById({ where: { id: dto.contactId } }),
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

  async update(id: string, dto: DTO.Task.UpdateBody) {
    const task = await this.getTaskById({ where: { id } })

    await this.userService.getOneUserById({ where: { id: dto.ownerId } })

    if (dto.leadId) {
      await this.leadService.getLeadById({ where: { id: dto.leadId, isLead: true } })
      dto.contactId = null
      dto.accountId = null
      dto.dealId = null
      return this.taskRepo.save({ ...task, ...dto })
    }

    if (dto.accountId)
      dto.dealId = null

    await Promise.all([
      dto.contactId
        ? this.contactService.getContactById({ where: { id: dto.contactId } })
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
}
