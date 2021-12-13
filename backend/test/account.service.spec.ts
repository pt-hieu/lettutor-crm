import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { account, lead } from './data'
import { mockQueryBuilder, MockType, repositoryMockFactory } from './utils'
import { AccountService } from 'src/account/account.service'
import { Account } from 'src/account/account.entity'
import { NotFoundException } from '@nestjs/common'
import { DTO } from 'src/type'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'

describe('account service', () => {
  let accountService: AccountService
  let accountRepo: MockType<Repository<Account>>

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getRepositoryToken(Account),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    accountRepo = ref.get(getRepositoryToken(Account))
    accountService = ref.get(AccountService)
  })

  describe('get many accounts', () => {
    it('should return accounts successfully', async () => {
      const dto: DTO.Account.GetManyQuery = {
        limit: 10,
        page: 1,
        shouldNotPaginate: false,
      }

      mockQueryBuilder.getMany.mockReturnValue([account])

      expect(
        (
          (await accountService.getMany(dto)) as Pagination<
            Account,
            IPaginationMeta
          >
        ).items,
      ).toEqual([account])
    })
    it('should return account that matches the search successfully', async () => {
      const dto: DTO.Account.GetManyQuery = {
        limit: 10,
        page: 1,
        search: lead.fullName + ' Account',
        shouldNotPaginate: false,
      }

      mockQueryBuilder.getMany.mockReturnValue([account])

      expect(
        (
          (await accountService.getMany(dto)) as Pagination<
            Account,
            IPaginationMeta
          >
        ).items,
      ).toEqual([account])
    })
  })
  describe('view account detail', () => {
    it('should view account detail success', async () => {
      accountRepo.findOne.mockReturnValue({ ...account })

      expect(
        await accountService.getAccountById({ where: { id: account.id } }),
      ).toEqual(account)
    })

    it('should throw not found exception when account not found ', async () => {
      accountRepo.findOne.mockReturnValue(undefined)

      expect(
        accountService.getAccountById({ where: { id: account.id } }),
      ).rejects.toThrow(
        new NotFoundException(`Account not found`),
      )
    })
  })
})
