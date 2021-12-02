import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'
import { LeadContact } from './lead-contact.entity'
import { paginate } from 'nestjs-typeorm-paginate'
import { AuthRequest } from 'src/utils/interface'

@Injectable()
export class LeadContactService {
  constructor(
    @InjectRepository(LeadContact)
    private leadContactRepo: Repository<LeadContact>,
  ) { }

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

  async getMany(query: DTO.LeadContact.GetManyQuery, req: AuthRequest) {
    let q = this.leadContactRepo
      .createQueryBuilder('lc')
      .select(['lc.ownerId', 'lc.fullName', 'lc.email',
        'lc.status', 'lc.source', 'lc.address', 'lc.description', 'lc.phoneNum', 'lc.socialAccount'])
      .where('lc.owner = :owner', { owner: req.user.id });

    if (query.status)
      q = q.andWhere('lc.status = :status', { status: query.status })
    if (query.status)
      q = q.andWhere('lc.source = :source', { source: query.source })

    if (query.search) {
      q = q
        .andWhere('lc.fullName ILIKE :search', { search: `%${query.search}%` })
        .orWhere('lc.email ILIKE :search', { search: `%${query.search}%` })
    }

    return paginate(q, { limit: query.limit, page: query.page })
  }
}
