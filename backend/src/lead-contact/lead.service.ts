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
import { Deal } from 'src/deal/deal.entity'

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(LeadContact)
    private leadContactRepo: Repository<LeadContact>,
    private readonly accountService: AccountService,
    private readonly dealService: DealService,
  ) {}

  async getLeadById(id: string) {
    const found = await this.leadContactRepo.findOne({ id })

    if (!found || !found.isLead) {
      throw new NotFoundException(`Lead with ID ${id} not found`)
    }

    return found
  }

  async addLead(dto: DTO.Lead.AddLead) {
    return this.leadContactRepo.save(dto)
  }

  async updateLead(dto: DTO.Lead.UpdateLead, id: string) {
    const lead = await this.getLeadById(id)

    return this.leadContactRepo.save({
      ...lead,
      ...dto,
    })
  }

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

  async convert(id: string, dealDto: DTO.Deal.AddDeal) {
    const lead = await this.getLeadById(id)

    const accountDto: DTO.Account.AddAccount = {
      ownerId: lead.owner.id,
      fullName: lead.fullName + ' Account',
      address: lead.address,
      description: lead.description,
      phoneNum: lead.phoneNum,
    }

    const account = await this.accountService.addAccount(accountDto)
    const contact = await this.leadContactRepo.save({
      ...lead,
      isLead: false, //make this lead a contact
      accountId: account.id,
    })

    let deal: Deal | null = null
    if (!!dealDto) {
      const dto = {
        ownerId: lead.owner.id,
        accountId: account.id,
        contactId: contact.id,
        ...dealDto,
      }

      deal = await this.dealService.addDeal(dto)
    }

    return [account, contact, deal] as const
  }
}
