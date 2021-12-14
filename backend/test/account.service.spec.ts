import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { account, lead, user } from './data'
import { mockQueryBuilder, MockType, repositoryMockFactory } from './utils'
import { AccountService } from 'src/account/account.service'
import { Account } from 'src/account/account.entity'
import { NotFoundException } from '@nestjs/common'
import { DTO } from 'src/type'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { UserService } from 'src/user/user.service'
import { Role, User } from 'src/user/user.entity'
import { MailService } from 'src/mail/mail.service'

describe('account service', () => {
  let accountService: AccountService
  let accountRepo: MockType<Repository<Account>>
  let userService: UserService
  let userRepo: MockType<Repository<User>>
  let mailService: MailService
  let roleRepo: MockType<Repository<Role>>

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        UserService,
        {
          provide: MailService,
          useValue: {
            sendResetPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
            sendAddPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Account),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    accountRepo = ref.get(getRepositoryToken(Account))
    accountService = ref.get(AccountService)
    userRepo = ref.get(getRepositoryToken(User))
    userService = ref.get(UserService)
    mailService = ref.get(MailService)
    roleRepo = ref.get(getRepositoryToken(Role))
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

    it('should throw not found exception when account not found', async () => {
      accountRepo.findOne.mockReturnValue(undefined)

      expect(
        accountService.getAccountById({ where: { id: account.id } }),
      ).rejects.toThrow(new NotFoundException(`Account not found`))
    })
  })

  describe('add account', () => {
    it('should add account succeed', async () => {
      const dto: DTO.Account.AddAccount = {
        ownerId: account.ownerId,
        fullName: account.fullName,
        type: account.type,
        address: account.address,
        description: account.description,
        phoneNum: account.phoneNum,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      accountRepo.save.mockReturnValue({ ...account })

      expect(await accountService.addAccount(dto)).toEqual(account)
    })

    it('should throw not found exception when owner not found', async () => {
      const dto: DTO.Account.AddAccount = {
        ownerId: '12345',
        fullName: account.fullName,
        type: account.type,
        address: account.address,
        description: account.description,
        phoneNum: account.phoneNum,
      }

      userRepo.findOne.mockReturnValue(undefined)
      accountRepo.save.mockReturnValue({ ...account })

      expect(accountService.addAccount(dto)).rejects.toThrow(
        new NotFoundException('User does not exist'),
      )
    })
  })
})
