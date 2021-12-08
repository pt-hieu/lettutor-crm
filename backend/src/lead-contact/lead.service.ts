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

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(LeadContact)
    private leadContactRepo: Repository<LeadContact>,
    private readonly accountService: AccountService,
  ) {}

  async getLeadById(id: string) {
    const found = await this.leadContactRepo.findOne({ id })

    if (!found) {
      throw new NotFoundException(`Lead with ID ${id} not found`)
    }

    return found
  }

  async addLead(dto: DTO.Lead.AddLead) {
    return this.leadContactRepo.save(dto)
  }

  async updateLead(dto: DTO.Lead.UpdateLead, id: string) {
    const lead = await this.leadContactRepo.findOne({ id })
    if (!lead) throw new NotFoundException('Lead does not exist')

    return this.leadContactRepo.save({
      ...lead,
      ...dto,
    })
  }

  async getMany(query: DTO.Lead.GetManyQuery) {
    let q = this.leadContactRepo
      .createQueryBuilder('lc')
      .leftJoin('lc.owner', 'owner')
      .addSelect(["owner.name", "owner.email"])
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

  async convertToAccountAndContact(id: string) {
    const lead = await this.getLeadById(id)

    if (String(lead.isLead) === 'false') {
      throw new BadRequestException('This is not a lead, cannot convert')
    }

    const accountDto: DTO.Account.AddAccount = {
      ownerId: id,
      fullName: lead.fullName + ' Account',
      email: lead.email,
      address: lead.address,
      description: lead.description,
      phoneNum: lead.phoneNum,
    }
    // Convert to account
    const account = await this.accountService.addAccount(accountDto)

    // Convert to contact
    lead.isLead = false
    lead.account = account
    await this.leadContactRepo.save(lead)

    return [account, lead]
  }
}
