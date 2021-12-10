import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { Brackets, Repository } from 'typeorm'
import { LeadContact } from './lead-contact.entity'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(LeadContact)
    private leadContactRepo: Repository<LeadContact>,
    private readonly accountService: AccountService,
  ) { }

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
            .orWhere('lc.description ILIKE :search', { search: `%${query.search}%` }),
        ),
      )
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async update(id: string, dto: DTO.Contact.UpdateBody) {
    const contact = await this.leadContactRepo.findOne({ id, isLead: false })
    if (!contact) throw new NotFoundException('Contact does not exist')

    if (dto.accountId) {
      const account = await this.accountService.getOneById(dto.accountId);
      if (!account) 
        throw new NotFoundException('Account does not exist')
    }

    const res = await this.leadContactRepo.update(id, {
      ...contact,
      ...dto
    })
    return {affected: res.affected}
  }
}
