import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { FindOneOptions, Repository } from 'typeorm'
import { LeadContact } from './lead-contact.entity'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { DealService } from 'src/deal/deal.service'
import { Deal } from 'src/deal/deal.entity'
import { UserService } from 'src/user/user.service'
import { UtilService } from 'src/global/util.service'

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(LeadContact)
    private leadContactRepo: Repository<LeadContact>,
    private readonly accountService: AccountService,
    private readonly dealService: DealService,
    private readonly userService: UserService,
    private readonly utilService: UtilService,
  ) {}

  async getMany(query: DTO.Lead.GetManyQuery) {
    let q = this.leadContactRepo
      .createQueryBuilder('lc')
      .leftJoin('lc.owner', 'owner')
      .addSelect(['owner.name', 'owner.email'])
      .where('lc.isLead = :isLead', { isLead: true })

    if (query.status)
      q.andWhere('lc.status IN (:...status)', { status: query.status })

    if (query.source)
      q.andWhere('lc.source IN (:...source)', { source: query.source })

    if (query.search) {
      q = q
        .andWhere('lc.fullName ILIKE :search', { search: `%${query.search}%` })
        .orWhere('lc.email ILIKE :search', { search: `%${query.search}%` })
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async getLeadById(option: FindOneOptions<LeadContact>, trace?: boolean) {
    const lead = await this.leadContactRepo.findOne(option)

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

    return this.leadContactRepo.save(dto)
  }

  async updateLead(dto: DTO.Lead.UpdateLead, id: string) {
    const lead = await this.getLeadById({ where: { id, isLead: true } })

    if (dto.ownerId) {
      await this.userService.getOneUserById({ where: { id: dto.ownerId } })
    }

    return this.leadContactRepo.save({
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
      where: { id, isLead: true },
      relations: ['owner', 'tasksOfLead', 'tasksOfLead.owner'],
    })

    if (ownerId) {
      const newOwner = await this.userService.getOneUserById({
        where: { id: ownerId },
      })
      lead.owner = newOwner
      await this.leadContactRepo.save(lead)
    }

    const accountDto: DTO.Account.AddAccount = {
      ownerId: lead.owner ? lead.owner.id : null,
      fullName: lead.fullName + ' Account',
      address: lead.address,
      description: lead.description,
      phoneNum: lead.phoneNum,
      tasks: lead.tasksOfLead,
    }

    const account = await this.accountService.addAccount(accountDto)

    const contact = await this.leadContactRepo.save({
      ...lead,
      tasksOfContact: lead.tasksOfLead,
      isLead: false, //make this lead a contact
      accountId: account.id,
    })

    let deal: Deal | null = null
    if (shouldConvertToDeal) {
      const dto: DTO.Deal.AddDeal = {
        ownerId: lead.owner ? lead.owner.id : null,
        accountId: account.id,
        contactId: contact.id,
        tasks: lead.tasksOfLead,
        ...dealDto,
      }

      deal = await this.dealService.addDeal(dto)
    }

    return [account, contact, deal] as const
  }
}
