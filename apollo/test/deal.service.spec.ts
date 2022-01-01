import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { MockType, repositoryMockFactory, mockQueryBuilder } from './utils'
import { Repository } from 'typeorm'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { account, contact, deal, user } from './data'
import { Deal } from 'src/deal/deal.entity'
import { DealService } from 'src/deal/deal.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'
import { MailService } from 'src/mail/mail.service'
import { Account } from 'src/account/account.entity'
import { AccountService } from 'src/account/account.service'
import { Role, User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { ContactService } from 'src/contact/contact.service'
import { Contact } from 'src/contact/contact.entity'
import { UtilService } from 'src/global/util.service'
import { NoteService } from 'src/note/note.service'
import { PayloadService } from 'src/global/payload.service'

describe('deal service', () => {
  let dealRepo: MockType<Repository<Deal>>
  let dealService: DealService
  let accountRepo: MockType<Repository<Account>>
  let contactRepo: MockType<Repository<Contact>>
  let userRepo: MockType<Repository<User>>

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        DealService,
        AccountService,
        ContactService,
        UserService,
        PayloadService,
        {
          provide: MailService,
          useValue: {
            sendResetPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
            sendAddPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
          },
        },
        {
          provide: NoteService,
          useValue: {
            addNote: jest.fn(),
          },
        },
        {
          provide: UtilService,
          useValue: {
            checkOwnership: jest.fn().mockReturnValue(true),
            checkRoleAction: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: getRepositoryToken(Deal),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Role),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Account),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Contact),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    dealRepo = ref.get(getRepositoryToken(Deal))
    dealService = ref.get(DealService)
    contactRepo = ref.get(getRepositoryToken(Contact))
    accountRepo = ref.get(getRepositoryToken(Account))
    userRepo = ref.get(getRepositoryToken(User))
  })

  describe('getMany', () => {
    it('should return deals succeed', async () => {
      const dto: DTO.Deal.GetManyQuery = {
        limit: 10,
        page: 1,
        shouldNotPaginate: false,
      }

      mockQueryBuilder.getMany.mockReturnValue([deal])

      expect(
        ((await dealService.getMany(dto)) as Pagination<Deal, IPaginationMeta>)
          .items,
      ).toEqual([deal])
    })
  })

  describe('update deal', () => {
    it('should update deal succeed', async () => {
      const dto: DTO.Deal.UpdateDeal = {}

      dealRepo.findOne.mockReturnValue({ ...deal })
      dealRepo.save.mockReturnValue({ ...deal, ...dto })

      expect(await dealService.updateDeal(dto, deal.id)).toEqual({
        ...deal,
        ...dto,
      })
    })

    it('should throw not found exception when deal not found', async () => {
      const dto: DTO.Deal.UpdateDeal = {}

      dealRepo.findOne.mockReturnValue(undefined)

      expect(dealService.updateDeal(dto, deal.id)).rejects.toThrow(
        new NotFoundException(`Deal not found`),
      )
    })
  })

  describe('view deal detail', () => {
    it('should view deal detail success', async () => {
      dealRepo.findOne.mockReturnValue({ ...deal })

      expect(await dealService.getDealById({ where: { id: deal.id } })).toEqual(
        deal,
      )
    })

    it('should throw not found exception when deal not found ', async () => {
      dealRepo.findOne.mockReturnValue(undefined)

      expect(
        dealService.getDealById({ where: { id: deal.id } }),
      ).rejects.toThrow(new NotFoundException(`Deal not found`))
    })
  })

  describe('add deal', () => {
    it('should add deal succeed with owner, account and contact', async () => {
      const dto: DTO.Deal.AddDeal = {
        ownerId: deal.ownerId,
        accountId: deal.accountId,
        contactId: deal.contactId,
        fullName: deal.fullName,
        closingDate: deal.closingDate,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      accountRepo.findOne.mockReturnValue({ ...account })
      contactRepo.findOne.mockReturnValue({ ...contact })
      dealRepo.save.mockReturnValue({ ...deal })

      expect(await dealService.addDeal(dto)).toEqual(deal)
    })

    it('should add deal succeed with owner and account', async () => {
      const dto: DTO.Deal.AddDeal = {
        ownerId: deal.ownerId,
        accountId: deal.accountId,
        fullName: deal.fullName,
        closingDate: deal.closingDate,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      accountRepo.findOne.mockReturnValue({ ...account })
      dealRepo.save.mockReturnValue({ ...deal })

      expect(await dealService.addDeal(dto)).toEqual(deal)
    })

    it('should throw not found exception when owner not found', async () => {
      const dto: DTO.Deal.AddDeal = {
        ownerId: deal.ownerId,
        accountId: deal.accountId,
        contactId: deal.contactId,
        fullName: deal.fullName,
        closingDate: deal.closingDate,
      }

      userRepo.findOne.mockReturnValue(undefined)
      accountRepo.findOne.mockReturnValue({ ...account })
      contactRepo.findOne.mockReturnValue({ ...contact })
      dealRepo.save.mockReturnValue({ ...deal })

      expect(dealService.addDeal(dto)).rejects.toThrow(
        new NotFoundException('User does not exist'),
      )
    })

    it('should throw not found exception when account not found', async () => {
      const dto: DTO.Deal.AddDeal = {
        ownerId: deal.ownerId,
        accountId: deal.accountId,
        contactId: deal.contactId,
        fullName: deal.fullName,
        closingDate: deal.closingDate,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      accountRepo.findOne.mockReturnValue(undefined)
      contactRepo.findOne.mockReturnValue({ ...contact })
      dealRepo.save.mockReturnValue({ ...deal })

      expect(dealService.addDeal(dto)).rejects.toThrow(
        new NotFoundException('Account not found'),
      )
    })

    it('should throw not found exception when contact not found', async () => {
      const dto: DTO.Deal.AddDeal = {
        ownerId: deal.ownerId,
        accountId: deal.accountId,
        contactId: deal.contactId,
        fullName: deal.fullName,
        closingDate: deal.closingDate,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      accountRepo.findOne.mockReturnValue({ ...account })
      contactRepo.findOne.mockReturnValue(undefined)
      dealRepo.save.mockReturnValue({ ...deal })

      expect(dealService.addDeal(dto)).rejects.toThrow(
        new NotFoundException('Contact not found'),
      )
    })
  })
})
