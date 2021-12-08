import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'
import { LeadContact } from './lead-contact.entity'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { DealService } from 'src/deal/deal.service'

@Injectable()
export class LeadContactService {
  constructor(
    @InjectRepository(LeadContact)
    private leadContactRepo: Repository<LeadContact>,
    private readonly accountService: AccountService,
    private readonly dealService: DealService,
  ) {}

  async getLeadById(id: string) {
    const found = await this.leadContactRepo.findOne({ id })

    if (!found) {
      throw new NotFoundException(`Lead with ID ${id} not found`)
    }

    return found
  }

  async addLead(dto: DTO.LeadContact.AddLead) {
    return this.leadContactRepo.save(dto)
  }

  async updateLead(dto: DTO.LeadContact.UpdateLead, id: string) {
    const lead = await this.leadContactRepo.findOne({ id })
    if (!lead) throw new NotFoundException('Lead does not exist')

    return this.leadContactRepo.save({
      ...lead,
      ...dto,
    })
  }

  async getMany(query: DTO.LeadContact.GetManyQuery) {
    let q = this.leadContactRepo
      .createQueryBuilder('lc')
      .leftJoinAndSelect('lc.owner', 'owner')

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

  async convertToAccountAndContact(id: string, dealDto: DTO.Deal.AddDeal) {
    const lead = await this.getLeadById(id)

    if (String(lead.isLead) === 'false') {
      throw new BadRequestException('This is not a lead, cannot convert')
    }

    const accountDto: DTO.Account.AddAccount = {
      ownerId: id,
      name: lead.fullName + ' Account',
      address: lead.address,
      description: lead.description,
      phoneNum: lead.phoneNum,
    }
    // Convert to account
    const account = await this.accountService.addAccount(accountDto)

    // Convert to contact
    lead.isLead = false
    lead.account = account
    const contact = await this.leadContactRepo.save(lead)

    let deal = null
    // Convert to deal
    if (dealDto.name !== undefined) {
      const dto = {
        ownerId: id,
        accountId: account.id,
        contactId: contact.id,
        ...dealDto,
      }
      deal = await this.dealService.addDeal(dto)
    }

    return deal === null ? [account, contact] : [account, contact, deal]
  }
}
