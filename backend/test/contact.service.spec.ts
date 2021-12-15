import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { account, contact, user } from './data'
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
  let userRepo: MockType<Repository<User>>
  let roleRepo: MockType<Repository<Role>>
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
          provide: getRepositoryToken(LeadContact),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Deal),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    leadContactRepo = ref.get(getRepositoryToken(LeadContact))
    roleRepo = ref.get(getRepositoryToken(Role))
    accountRepo = ref.get(getRepositoryToken(Account))
    dealRepo = ref.get(getRepositoryToken(Deal))
    userRepo = ref.get(getRepositoryToken(User))
    contactService = ref.get(ContactService)
    mailService = ref.get(MailService)
    accountService = ref.get(AccountService)
    dealService = ref.get(DealService)
    userService = ref.get(UserService)
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

      expect(
        await contactService.getContactById({ where: { id: contact.id } }),
      ).toEqual(contact)
    })

    it('should throw not found exception when contact not found', async () => {
      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(
        contactService.getContactById({ where: { id: contact.id } }),
      ).rejects.toThrow(new NotFoundException(`Contact not found`))
    })
  })

  describe('update contact', () => {
    it('should update the contact successfully', async () => {
      const dto: DTO.Contact.UpdateBody = {
        email: 'update@mail.com',
      }

      leadContactRepo.findOne.mockReturnValue({ ...contact })
      leadContactRepo.save.mockReturnValue({ ...contact, ...dto })

      accountRepo.findOne.mockReturnValue({ ...account })
      userRepo.findOne.mockReturnValue({ ...user })

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
        new NotFoundException(`Contact not found`),
      )
    })

    it('should update the contact with accountId successfully', async () => {
      const dto: DTO.Contact.UpdateBody = {
        accountId: account.id,
        email: 'update@mail.com',
      }

      leadContactRepo.findOne.mockReturnValue({ ...contact })
      leadContactRepo.save.mockReturnValue({ ...contact, ...dto })
      accountRepo.findOne.mockReturnValue({ ...account })
      userRepo.findOne.mockReturnValue({ ...user })

      expect(await contactService.update(contact.id, dto)).toEqual({
        ...contact,
        ...dto,
      })
    })

    it('should throw not found exception in case update body have any field is invalid', async () => {
      const dto: DTO.Contact.UpdateBody = {
        accountId: account.id,
        email: 'update@mail.com',
      }

      leadContactRepo.findOne.mockReturnValue({ ...contact })
      accountRepo.findOne.mockReturnValue(undefined)

      expect(contactService.update(contact.id, dto)).rejects.toThrow(
        new NotFoundException(`Account not found`),
      )
    })
  })

  describe('add contact', () => {
    it('should add contact succeed with both owner and account', async () => {
      const dto: DTO.Contact.AddContact = {
        ownerId: contact.ownerId,
        accountId: contact.accountId,
        fullName: contact.fullName,
        email: contact.email,
        source: contact.source,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      accountRepo.findOne.mockReturnValue({ ...account })
      leadContactRepo.save.mockReturnValue({ ...contact })

      expect(await contactService.addContact(dto)).toEqual(contact)
    })

    it('should add contact succeed with only owner', async () => {
      const dto: DTO.Contact.AddContact = {
        ownerId: contact.ownerId,
        fullName: contact.fullName,
        email: contact.email,
        source: contact.source,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadContactRepo.save.mockReturnValue({ ...contact })

      expect(await contactService.addContact(dto)).toEqual(contact)
    })

    it('should throw not found exception when owner not found', async () => {
      const dto: DTO.Contact.AddContact = {
        ownerId: contact.ownerId,
        accountId: contact.accountId,
        fullName: contact.fullName,
        email: contact.email,
        source: contact.source,
      }

      userRepo.findOne.mockReturnValue(undefined)
      accountRepo.findOne.mockReturnValue({ ...account })
      leadContactRepo.save.mockReturnValue({ ...contact })

      expect(contactService.addContact(dto)).rejects.toThrow(
        new NotFoundException('User does not exist'),
      )
    })

    it('should throw not found exception when account not found', async () => {
      const dto: DTO.Contact.AddContact = {
        ownerId: contact.ownerId,
        accountId: contact.accountId,
        fullName: contact.fullName,
        email: contact.email,
        source: contact.source,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      accountRepo.findOne.mockReturnValue(undefined)
      leadContactRepo.save.mockReturnValue({ ...contact })

      expect(contactService.addContact(dto)).rejects.toThrow(
        new NotFoundException('Account not found'),
      )
    })
  })
})
