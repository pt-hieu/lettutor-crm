import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { account } from './data'
import { mockQueryBuilder, MockType, repositoryMockFactory } from './utils'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { Account } from 'src/account/account.entity'

describe('lead-contact service', () => {
  let accountService: AccountService
  let accountRepo: MockType<Repository<Account>>

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getRepositoryToken(Account),
          useFactory: repositoryMockFactory,
        }
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
          (await accountService.getMany(dto)) as Pagination<Account, IPaginationMeta>
        ).items,
      ).toEqual([account])
    })
  })

})

