import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { account, contact, deal, lead, user } from './data'
import { mockQueryBuilder, MockType, repositoryMockFactory } from './utils'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { Account } from 'src/account/account.entity'
import { DealService } from 'src/deal/deal.service'
import { Deal } from 'src/deal/deal.entity'
import { ContactService } from 'src/lead-contact/contact.service'
import { NotFoundException } from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import { Role, User } from 'src/user/user.entity'
import { MailService } from 'src/mail/mail.service'

describe('lead-contact service', () => {
  let leadContactRepo: MockType<Repository<LeadContact>>
  let contactService: ContactService
  let accountService: AccountService
  let accountRepo: MockType<Repository<Account>>
  let dealService: DealService
  let dealRepo: MockType<Repository<Deal>>
  let userService: UserService
  let userRepo: MockType<Repository<[User, Role]>>
  let mailService: MailService

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        AccountService,
        DealService,
        UserService,
        {
          provide: MailService,
          useValue: {
            sendResetPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
            sendAddPwdMail: jest.fn().mockReturnValue(Promise.resolve(true)),
          },
        },
        {
          provide: getRepositoryToken(Account),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(LeadContact),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Deal),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Role),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    leadContactRepo = ref.get(getRepositoryToken(LeadContact))
    accountRepo = ref.get(getRepositoryToken(Account))
    dealRepo = ref.get(getRepositoryToken(Deal))
    userRepo = ref.get(getRepositoryToken(User))
    contactService = ref.get(ContactService)
    accountService = ref.get(AccountService)
    dealService = ref.get(DealService)
    userService = ref.get(UserService)
    mailService = ref.get(MailService)
  })

  describe('get many contacts', () => {
    it('should return contacts successfully', async () => {
      const dto: DTO.Contact.GetManyQuery = {
        limit: 10,
        page: 1,
        shouldNotPaginate: false,
      }

      mockQueryBuilder.getMany.mockReturnValue([contact])

      expect(
        (
          (await contactService.getMany(dto)) as Pagination<
            LeadContact,
            IPaginationMeta
          >
        ).items,
      ).toEqual([contact])
    })
  })

  describe('view contact detail', () => {
    it('should view contact detail success', async () => {
      leadContactRepo.findOne.mockReturnValue({ ...contact })
      mockQueryBuilder.getMany.mockReturnValue([deal])
      const deals = [deal]
      expect(await contactService.getContactById(contact.id)).toEqual({
        contact,
        deals,
      })
    })

    it('should throw not found exception when contact not found', async () => {
      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(contactService.getContactById(contact.id)).rejects.toThrow(
        new NotFoundException(`Contact with ID ${contact.id} not found`),
      )
    })
  })

  describe('update contact', () => {
    it('should update the contact successfully', async () => {
      const dto: DTO.Contact.UpdateBody = {
        email: 'update@mail.com',
      }
      leadContactRepo.findOne.mockReturnValue({ ...contact })
      mockQueryBuilder.getMany.mockReturnValue([deal])
      leadContactRepo.save.mockReturnValue({ ...contact, ...dto })

      expect(await contactService.update(contact.id, dto)).toEqual({
        ...contact,
        ...dto,
      })
    })

    it('should throw not found exception when contact is not found', async () => {
      const dto: DTO.Contact.UpdateBody = {
        email: 'update@mail.com',
      }

      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(contactService.update(contact.id, dto)).rejects.toThrow(
        new NotFoundException(`Contact with ID ${lead.id} not found`),
      )
    })

    it('should update the contact with accountId successfully', async () => {
      const dto: DTO.Contact.UpdateBody = {
        accountId: account.id,
        email: 'update@mail.com',
      }

      leadContactRepo.findOne.mockReturnValue({ ...contact })
      accountRepo.findOne.mockReturnValue({ ...account })
      leadContactRepo.save.mockReturnValue({ ...contact, ...dto })

      expect(await contactService.update(contact.id, dto)).toEqual({
        ...contact,
        ...dto,
      })
    })

    it('should update the contact with ownerId successfully', async () => {
      const dto: DTO.Contact.UpdateBody = {
        ownerId: user.id,
        email: 'update@mail.com',
      }

      leadContactRepo.findOne.mockReturnValue({ ...contact })
      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.save.mockReturnValue({ ...contact, ...dto })

      expect(await contactService.update(contact.id, dto)).toEqual({
        ...contact,
        ...dto,
      })
    })
  })
})
