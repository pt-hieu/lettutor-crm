import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'
import { Account } from './account.entity'

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
  ) {}

  async getAccountById(id: string) {
    const found = await this.accountRepo.findOne({ id })

    if (!found) {
      throw new NotFoundException(`Account with ID ${id} not found`)
    }

    return found
  }

  async addAccount(dto: DTO.Account.AddAccount) {
    return this.accountRepo.save(dto)
  }

  async getMany(query: DTO.Account.GetManyQuery) {
    let q = this.accountRepo
      .createQueryBuilder('acc')
      .select()
      
    if (query.search) {
      q = q
        .andWhere('acc.fullName ILIKE :search', { search: `%${query.search}%` })
    }

    if (query.shouldNotPaginate === true) return q.getMany()
    return paginate(q, { limit: query.limit, page: query.page })
  }

}