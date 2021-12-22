import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AccountService } from 'src/account/account.service'
import { DealService } from 'src/deal/deal.service'
import { ContactService } from 'src/lead-contact/contact.service'
import { LeadService } from 'src/lead-contact/lead.service'
import { DTO } from 'src/type'
import { UserService } from 'src/user/user.service'
import { Repository } from 'typeorm'
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
  ) {}

  async addTask(dto: DTO.Task.AddTask) {
    await this.userService.getOneUserById({ where: { id: dto.ownerId } })

    if (dto.leadId === undefined && dto.contactId === undefined) {
      throw new BadRequestException('Lead or Contact must be chosen')
    }

    if (dto.leadId) {
      await this.leadService.getLeadById({ where: { id: dto.leadId } })
      dto.accountId = null
      dto.contactId = null
      dto.dealId = null
    } else if (dto.contactId) {
      dto.leadId = null
      if (dto.accountId === undefined && dto.dealId === undefined) {
        throw new BadRequestException('Account or Deal must be chosen')
      }

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
}
