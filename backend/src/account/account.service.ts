import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'
import { Account } from './account.entity'

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
  ) {}

  async addAccount(dto: DTO.Account.AddAccount) {
    return this.accountRepo.save(dto)
  }

  async getOneById(id: string) {
    return this.accountRepo.findOne({id})
  }
}
