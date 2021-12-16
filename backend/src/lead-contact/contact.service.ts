import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { Brackets, FindOneOptions, Repository } from 'typeorm'
import { LeadContact } from './lead-contact.entity'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { UserService } from 'src/user/user.service'

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(LeadContact)
    private leadContactRepo: Repository<LeadContact>,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
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

  async getContactById(option: FindOneOptions<LeadContact>) {
    const found = await this.leadContactRepo.findOne(option)

    if (!found) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Contact not found`)
    }

    return found
  }

  async addContact(dto: DTO.Contact.AddContact) {
    await Promise.all([
      dto.accountId
        ? this.accountService.getAccountById({ where: { id: dto.accountId } })
        : undefined,
      dto.ownerId
        ? this.userService.getOneUserById({ where: { id: dto.ownerId } })
        : undefined,
    ])

    return this.leadContactRepo.save(dto)
  }

  async update(id: string, dto: DTO.Contact.UpdateBody) {
    const contact = await this.getContactById({ where: { id, isLead: false } })

    await Promise.all([
      dto.accountId
        ? this.accountService.getAccountById({ where: { id: dto.accountId } })
        : undefined,
      dto.ownerId
        ? this.userService.getOneUserById({ where: { id: dto.ownerId } })
        : undefined,
    ])

    return this.leadContactRepo.save({
      ...contact,
      ...dto,
    })
  }
}
