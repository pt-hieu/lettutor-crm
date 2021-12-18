import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { DTO } from 'src/type'
import { UserService } from 'src/user/user.service'
import { FindOneOptions, Repository } from 'typeorm'
import { Account } from './account.entity'

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    private readonly userService: UserService,
  ) { }

  async getAccountById(option: FindOneOptions<Account>) {
    const account = await this.accountRepo.findOne(option)

    if (!account) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Account not found`)
    }

    return account
  }

  async addAccount(dto: DTO.Account.AddAccount) {
    if (dto.ownerId) {
      await this.userService.getOneUserById({ where: { id: dto.ownerId } })
    }

    return this.accountRepo.save(dto)
  }

  async getMany(query: DTO.Account.GetManyQuery) {
    let q = this.accountRepo
      .createQueryBuilder('acc')
      .leftJoin('acc.owner', 'owner')
      .addSelect(['owner.name', 'owner.email'])

    if (query.type)
      q.andWhere('acc.type IN (:...type)', { type: query.type })

    if (query.search) {
      q = q.andWhere('acc.fullName ILIKE :search', {
        search: `%${query.search}%`,
      })
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

  async updateAccount(dto: DTO.Account.UpdateAccount, id: string) {
    const account = await this.getAccountById({ where: { id } })

    if (dto.ownerId) {
      await this.userService.getOneUserById({ where: { id: dto.ownerId } })
    }

    return this.accountRepo.save({
      ...account,
      ...dto,
    })
  }
}
