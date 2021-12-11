import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { account } from './data'
import { MockType, repositoryMockFactory } from './utils'
import { AccountService } from 'src/account/account.service'
import { Account } from 'src/account/account.entity'
import { NotFoundException } from '@nestjs/common'

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

  describe('view account detail', () => {
    it('should view account detail success', async () => {
      accountRepo.findOne.mockReturnValue({ ...account })

      expect(await accountService.getAccountById(account.id)).toEqual(account)
    })

    it('should throw not found exception when account not found ', async () => {
      accountRepo.findOne.mockReturnValue(undefined)

      expect(accountService.getAccountById(account.id)).rejects.toThrow(
        new NotFoundException(`Account with ID ${account.id} not found`),
      )
    })
  })
})
