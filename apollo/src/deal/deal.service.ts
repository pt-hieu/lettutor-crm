import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { ContactService } from 'src/lead-contact/contact.service'
import { DTO } from 'src/type'
import { UserService } from 'src/user/user.service'
import { FindOneOptions, Repository } from 'typeorm'
import { Deal } from './deal.entity'

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(Deal)
    private dealRepo: Repository<Deal>,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly contactService: ContactService,
  ) {}

  async getMany(query: DTO.Deal.GetManyQuery) {
    let q = this.dealRepo
      .createQueryBuilder('d')
      .leftJoin('d.owner', 'owner')
      .leftJoin('d.account', 'account')
      .leftJoin('d.contact', 'contact')
      .leftJoin('d.tasks', 'tasks')
      .addSelect([ 
        'owner.name',
        'owner.email',
        'account.fullName',
        'account.description',
        'contact.fullName',
        'tasks.subject',
        'tasks.dueDate',
        'tasks.id',
      ])

    if (query.source)
      q.andWhere('d.source IN (:...source)', { source: query.source })

    if (query.stage)
      q.andWhere('d.stage IN (:...stage)', { stage: query.stage })

    if (query.search) {
      q = q.andWhere('d.fullName ILIKE :search', {
        search: `%${query.search}%`,
      })
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async getDealById(option: FindOneOptions<Deal>) {
    const deal = await this.dealRepo.findOne(option)

    if (!deal) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Deal not found`)
    }

    return deal
  }

  async addDeal(dto: DTO.Deal.AddDeal) {
    await Promise.all([
      dto.accountId
        ? this.accountService.getAccountById({ where: { id: dto.accountId } })
        : undefined,
      dto.ownerId
        ? this.userService.getOneUserById({ where: { id: dto.ownerId } })
        : undefined,
      dto.contactId
        ? this.contactService.getContactById({ where: { id: dto.contactId } })
        : undefined,
    ])

    return this.dealRepo.save(dto)
  }

  async updateDeal(dto: DTO.Deal.UpdateDeal, id: string) {
    const deal = await this.getDealById({ where: { id } })

    return this.dealRepo.save({
      ...deal,
      ...dto,
    })
  }
}
