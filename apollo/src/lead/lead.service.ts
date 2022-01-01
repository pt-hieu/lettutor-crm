import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { FindOneOptions, Repository } from 'typeorm'
import { Lead } from './lead.entity'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { DealService } from 'src/deal/deal.service'
import { Deal } from 'src/deal/deal.entity'
import { UserService } from 'src/user/user.service'
import { UtilService } from 'src/global/util.service'
import { ContactService } from 'src/contact/contact.service'
import { User } from 'src/user/user.entity'
import { Task } from 'src/task/task.entity'
import { TaskService } from 'src/task/task.service'

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    private readonly accountService: AccountService,
    private readonly dealService: DealService,
    private readonly userService: UserService,
    private readonly contactService: ContactService,
    private readonly taskService: TaskService,
    private readonly utilService: UtilService,
  ) {}

  async getMany(query: DTO.Lead.GetManyQuery) {
    let q = this.leadRepo
      .createQueryBuilder('l')
      .leftJoin('l.owner', 'owner')
      .addSelect(['owner.name', 'owner.email'])

    if (query.isToday) {
      const d = new Date()
      const beginDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
      q.andWhere('l.createdAt BETWEEN :begin AND :end', {
        begin: beginDate.toISOString(),
        end: endDate.toISOString(),
      })
    }

    if (query.status)
      q.andWhere('l.status IN (:...status)', { status: query.status })

    if (query.source)
      q.andWhere('l.source IN (:...source)', { source: query.source })

    if (query.search) {
      q = q
        .andWhere('l.fullName ILIKE :search', { search: `%${query.search}%` })
        .orWhere('l.email ILIKE :search', { search: `%${query.search}%` })
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async getLeadById(option: FindOneOptions<Lead>, trace?: boolean) {
    const lead = await this.leadRepo.findOne(option)

    if (!lead) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Lead not found`)
    }

    if (trace) {
      await this.utilService.loadTraceInfo(lead)
    }

    return lead
  }

  async addLead(dto: DTO.Lead.AddLead) {
    if (dto.ownerId) {
      await this.userService.getOneUserById({ where: { id: dto.ownerId } })
    }

    return this.leadRepo.save(dto)
  }

  async updateLead(dto: DTO.Lead.UpdateLead, id: string) {
    const lead = await this.getLeadById({ where: { id } })

    if (dto.ownerId) {
      await this.userService.getOneUserById({ where: { id: dto.ownerId } })
    }

    return this.leadRepo.save({
      ...lead,
      ...dto,
    })
  }

  async convert(
    id: string,
    dealDto: DTO.Deal.ConvertToDeal,
    shouldConvertToDeal: boolean,
    ownerId: string,
  ) {
    const lead = await this.getLeadById({
      where: { id },
      relations: ['owner', 'tasks', 'tasks.owner'],
    })

    let newOwner: User
    if (ownerId) {
      newOwner = await this.userService.getOneUserById({
        where: { id: ownerId },
      })
    }

    const accountDto: DTO.Account.AddAccount = {
      ownerId: newOwner ? newOwner.id : lead.owner ? lead.owner.id : null,
      fullName: lead.fullName + ' Account',
      address: lead.address,
      description: lead.description,
      phoneNum: lead.phoneNum,
    }

    const account = await this.accountService.addAccount(accountDto)

    const contactDto: DTO.Contact.AddContact = {
      ownerId: newOwner ? newOwner.id : lead.owner ? lead.owner.id : null,
      accountId: account.id,
      fullName: lead.fullName,
      email: lead.email,
      source: lead.source,
      address: lead.address,
      description: lead.description,
      phoneNum: lead.phoneNum,
      socialAccount: lead.socialAccount,
    }

    const contact = await this.contactService.addContact(contactDto)

    const tasks: Task[] = lead.tasks
    let deal: Deal | null = null
    if (shouldConvertToDeal) {
      const dto: DTO.Deal.AddDeal = {
        ownerId: lead.owner ? lead.owner.id : null,
        accountId: account.id,
        contactId: contact.id,
        ...dealDto,
      }

      deal = await this.dealService.addDeal(dto)
      // update tasks of lead with deal and contact
      tasks.forEach((task) => {
        task.leadId = null
        task.dealId = deal.id
        task.contactId = contact.id
      })
    } else {
      // update tasks of lead with account and contact
      tasks.forEach((task) => {
        task.leadId = null
        task.accountId = account.id
        task.contactId = contact.id
      })
    }

    await this.taskService.updateAllTasks(tasks)
    await this.leadRepo.softDelete({ id: lead.id })

    return [account, contact, deal] as const
  }
}
