import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { account, contact } from './data'
import { mockQueryBuilder, MockType, repositoryMockFactory } from './utils'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { Account } from 'src/account/account.entity'
import { DealService } from 'src/deal/deal.service'
import { Deal } from 'src/deal/deal.entity'
import { ContactService } from 'src/lead-contact/contact.service'
import { NotFoundException } from '@nestjs/common'

describe('lead-contact service', () => {
  let leadContactRepo: MockType<Repository<LeadContact>>
  let contactService: ContactService
  let accountServie: AccountService
  let accountRepo: MockType<Repository<Account>>
  let dealService: DealService
  let dealRepo: MockType<Repository<Deal>>

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        AccountService,
        DealService,
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
    accountRepo = ref.get(getRepositoryToken(Account))
    dealRepo = ref.get(getRepositoryToken(Deal))
    contactService = ref.get(ContactService)
    accountServie = ref.get(AccountService)
    dealService = ref.get(DealService)
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

      expect(await contactService.getContactById(contact.id)).toEqual(contact)
    })

    it('should throw not found exception when contact not found ', async () => {
      leadContactRepo.findOne.mockReturnValue({ ...contact })

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
      leadContactRepo.update.mockReturnValue({ affected: 1 })

      expect(await contactService.update(contact.id, dto)).toEqual({ affected: 1 })
    })

    it('should throw not found exception when contact is not found', async () => {
      const dto: DTO.Contact.UpdateBody = {
        email: 'update@mail.com',
      }

      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(contactService.update(contact.id, dto)).rejects.toThrow(
        new NotFoundException(`Contact does not exist`),
      )
    })

    it('should update the contact with accountId successfully', async () => {
      const dto: DTO.Contact.UpdateBody = {
        accountId: account.id,
        email: 'update@mail.com',
      }

      leadContactRepo.findOne.mockReturnValue({ ...contact })
      accountRepo.findOne.mockReturnValue({ ...account })
      leadContactRepo.update.mockReturnValue({ affected: 1 })

      expect(await contactService.update(contact.id, dto)).toEqual({ affected: 1 })
    })

    it('should throw not found exception in case update body have any field is invalid', async () => {
      const dto: DTO.Contact.UpdateBody = {
        accountId: account.id,
        email: 'update@mail.com',
      }

      leadContactRepo.findOne.mockReturnValue({ ...contact })
      accountRepo.findOne.mockReturnValue(undefined)
      expect(contactService.update(contact.id, dto)).rejects.toThrow(
        new NotFoundException('Account does not exist'))
    })
  })

  
})

