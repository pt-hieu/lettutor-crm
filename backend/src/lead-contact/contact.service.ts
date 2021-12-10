import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { Brackets, Repository } from 'typeorm'
import { LeadContact } from './lead-contact.entity'
import { paginate } from 'nestjs-typeorm-paginate'
@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(LeadContact)
    private leadContactRepo: Repository<LeadContact>,
  ) {}

  async getMany(query: DTO.Contact.GetManyQuery) {
    let q = this.leadContactRepo
      .createQueryBuilder('lc')
      .leftJoin('lc.owner', 'owner')
      .addSelect(['owner.name', 'owner.email'])
      .leftJoin('lc.account', 'account')
      .addSelect(['account.fullName', 'account.description'])
      .where('lc.isLead = :isLead', { isLead: false })

    if (query.source)
      q.andWhere('lc.source IN (:...source)', { source: query.source })

    if (query.search) {
      q = q.andWhere(
        new Brackets((qb) =>
          qb
            .andWhere('lc.fullName ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('lc.description ILIKE :search', {
              search: `%${query.search}%`,
            }),
        ),
      )
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async getContactById(id: string) {
    const found = await this.leadContactRepo.findOne({ id })

    if (!found || found.isLead) {
      throw new NotFoundException(`Contact with ID ${id} not found`)
    }

    return found
  }
}
