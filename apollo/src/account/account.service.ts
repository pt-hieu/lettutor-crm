import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { FindOneOptions, In, Repository } from 'typeorm'

import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { DTO } from 'src/type'
import { Actions } from 'src/type/action'
import { UserService } from 'src/user/user.service'

import { Account } from './account.entity'

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    private readonly userService: UserService,
    private readonly utilService: UtilService,
    private readonly payloadService: PayloadService,
  ) {}

  async getAccountById(option: FindOneOptions<Account>, trace?: boolean) {
    const account = await this.accountRepo.findOne(option)

    if (!account) {
      Logger.error(JSON.stringify(option, null, 2))
      throw new NotFoundException(`Account not found`)
    }

    if (
      !this.utilService.checkRoleAction(Actions.IS_ADMIN) &&
      !this.utilService.checkOwnership(account) &&
      !this.utilService.checkRoleAction(Actions.VIEW_ALL_ACCOUNT_DETAILS) &&
      !this.utilService.checkRoleAction(
        Actions.VIEW_AND_EDIT_ALL_ACCOUNT_DETAILS,
      )
    ) {
      throw new ForbiddenException()
    }

    let tasksToDisplay = []

    account.tasks
      ? (tasksToDisplay = tasksToDisplay.concat(account.tasks))
      : undefined

    account.deals
      ? account.deals.forEach((deal) => {
          deal.tasks
            ? (tasksToDisplay = tasksToDisplay.concat(deal.tasks))
            : undefined
        })
      : undefined

    account.contacts
      ? account.contacts.forEach((contact) => {
          contact.tasks
            ? (tasksToDisplay = tasksToDisplay.concat(contact.tasks))
            : undefined
        })
      : undefined

    account['tasksToDisplay'] = [
      ...new Map(tasksToDisplay.map((o) => [o.id, o])).values(),
    ]

    if (trace) {
      await this.utilService.loadTraceInfo(account)
    }

    return account
  }

  async addAccount(dto: DTO.Account.AddAccount) {
    if (dto.ownerId) {
      await this.userService.getOneUserById({ where: { id: dto.ownerId } })
    }

    return this.accountRepo.save(dto)
  }

  getManyRaw() {
    return this.accountRepo.find({
      select: ['id', 'fullName'],
    })
  }

  async getMany(query: DTO.Account.GetManyQuery) {
    let q = this.accountRepo
      .createQueryBuilder('acc')
      .leftJoin('acc.owner', 'owner')
      .addSelect(['owner.name', 'owner.email'])
      .orderBy('acc.createdAt', 'DESC')

    if (!this.utilService.checkRoleAction(Actions.VIEW_ALL_ACCOUNTS)) {
      q.andWhere('owner.id = :id', { id: this.payloadService.data.id })
    }

    if (query.type) q.andWhere('acc.type IN (:...type)', { type: query.type })

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

    if (
      !this.utilService.checkRoleAction(Actions.IS_ADMIN) &&
      !this.utilService.checkOwnership(account) &&
      !this.utilService.checkRoleAction(
        Actions.VIEW_AND_EDIT_ALL_ACCOUNT_DETAILS,
      )
    ) {
      throw new ForbiddenException()
    }

    if (dto.ownerId) {
      await this.userService.getOneUserById({ where: { id: dto.ownerId } })
    }

    return this.accountRepo.save({
      ...account,
      ...dto,
    })
  }

  async batchDelete(ids: string[]) {
    const accounts = await this.accountRepo.find({ where: { id: In(ids) } })
    for (const account of accounts) {
      if (
        !this.utilService.checkOwnership(account) &&
        !this.utilService.checkRoleAction(Actions.DELETE_ACCOUNT)
      ) {
        throw new ForbiddenException()
      }
    }

    return this.accountRepo.softRemove(accounts)
  }
}
