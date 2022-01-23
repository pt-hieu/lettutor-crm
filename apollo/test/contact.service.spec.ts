import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { account, contact, user } from './data'
import { mockQueryBuilder, MockType, repositoryMockFactory } from './utils'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { Account } from 'src/account/account.entity'
import { DealService } from 'src/deal/deal.service'
import { Deal } from 'src/deal/deal.entity'
import { NotFoundException } from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import { User } from 'src/user/user.entity'
import { MailService } from 'src/mail/mail.service'
import { Contact } from 'src/contact/contact.entity'
import { ContactService } from 'src/contact/contact.service'
import { UtilService } from 'src/global/util.service'
import { NoteService } from 'src/note/note.service'
import { PayloadService } from 'src/global/payload.service'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { Role } from 'src/role/role.entity'

describe('contact service', () => {
  let contactRepo: MockType<Repository<Contact>>
  let contactService: ContactService
  let accountRepo: MockType<Repository<Account>>
  let userRepo: MockType<Repository<User>>

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        ContactService,
        AccountService,
        DealService,
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
          provide: UtilService,
          useValue: {
            checkOwnership: jest.fn().mockReturnValue(true),
            checkRoleAction: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: NoteService,
          useValue: {
            addNote: jest.fn(),
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
          provide: getRepositoryToken(Contact),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Deal),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    contactRepo = ref.get(getRepositoryToken(Contact))
    accountRepo = ref.get(getRepositoryToken(Account))
    userRepo = ref.get(getRepositoryToken(User))
    contactService = ref.get(ContactService)
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
            Contact,
            IPaginationMeta
          >
        ).items,
      ).toEqual([contact])
    })
  })

  describe('view contact detail', () => {
    it('should view contact detail success', async () => {
      contactRepo.findOne.mockReturnValue({ ...contact })

      expect(
        await contactService.getContactById({ where: { id: contact.id } }),
      ).toEqual(contact)
    })

    it('should throw not found exception when contact not found', async () => {
      contactRepo.findOne.mockReturnValue(undefined)

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

      contactRepo.findOne.mockReturnValue({ ...contact })
      contactRepo.save.mockReturnValue({ ...contact, ...dto })

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

      contactRepo.findOne.mockReturnValue(undefined)

      expect(contactService.update(contact.id, dto)).rejects.toThrow(
        new NotFoundException(`Contact not found`),
      )
    })

    it('should update the contact with accountId successfully', async () => {
      const dto: DTO.Contact.UpdateBody = {
        accountId: account.id,
        email: 'update@mail.com',
      }

      contactRepo.findOne.mockReturnValue({ ...contact })
      contactRepo.save.mockReturnValue({ ...contact, ...dto })
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

      contactRepo.findOne.mockReturnValue({ ...contact })
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
      contactRepo.save.mockReturnValue({ ...contact })

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
      contactRepo.save.mockReturnValue({ ...contact })

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
      contactRepo.save.mockReturnValue({ ...contact })

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
      contactRepo.save.mockReturnValue({ ...contact })

      expect(contactService.addContact(dto)).rejects.toThrow(
        new NotFoundException('Account not found'),
      )
    })
  })
})
