import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { account, contact, deal, lead, user } from './data'
import { mockQueryBuilder, MockType, repositoryMockFactory } from './utils'
import { NotFoundException } from '@nestjs/common'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { Account } from 'src/account/account.entity'
import { DealService } from 'src/deal/deal.service'
import { Deal } from 'src/deal/deal.entity'
import { UserService } from 'src/user/user.service'
import { Role, User } from 'src/user/user.entity'
import { MailService } from 'src/mail/mail.service'
import { LeadService } from 'src/lead/lead.service'
import { Lead } from 'src/lead/lead.entity'
import { ContactService } from 'src/contact/contact.service'
import { Contact } from 'src/contact/contact.entity'
import { UtilService } from 'src/global/util.service'
import { NoteService } from 'src/note/note.service'

describe('lead service', () => {
  let leadService: LeadService
  let leadRepo: MockType<Repository<Lead>>
  let contactRepo: MockType<Repository<Contact>>
  let accountRepo: MockType<Repository<Account>>
  let dealRepo: MockType<Repository<Deal>>
  let userRepo: MockType<Repository<User>>

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        AccountService,
        DealService,
        UserService,
        ContactService,
        UtilService,
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
          provide: getRepositoryToken(Lead),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Deal),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Contact),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    leadRepo = ref.get(getRepositoryToken(Lead))
    contactRepo = ref.get(getRepositoryToken(Contact))
    userRepo = ref.get(getRepositoryToken(User))
    accountRepo = ref.get(getRepositoryToken(Account))
    dealRepo = ref.get(getRepositoryToken(Deal))
    leadService = ref.get(LeadService)
  })

  describe('add lead', () => {
    it('should add lead succeed', async () => {
      const dto: DTO.Lead.AddLead = {
        ownerId: lead.ownerId,
        fullName: lead.fullName,
        email: lead.email,
        status: lead.status,
        source: lead.source,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadRepo.save.mockReturnValue({ ...lead })

      expect(await leadService.addLead(dto)).toEqual(lead)
    })

    it('should throw not found exception when owner not found', async () => {
      const dto: DTO.Lead.AddLead = {
        ownerId: lead.ownerId,
        fullName: lead.fullName,
        email: lead.email,
        status: lead.status,
        source: lead.source,
      }

      userRepo.findOne.mockReturnValue(undefined)
      leadRepo.save.mockReturnValue({ ...lead })

      expect(leadService.addLead(dto)).rejects.toThrow(
        new NotFoundException('User does not exist'),
      )
    })
  })

  describe('view lead detail', () => {
    it('should view lead detail succeed', async () => {
      leadRepo.findOne.mockReturnValue({ ...lead })

      expect(await leadService.getLeadById({ where: { id: lead.id } })).toEqual(
        lead,
      )
    })

    it('should throw exception when lead not found', () => {
      leadRepo.findOne.mockReturnValue(undefined)

      expect(
        leadService.getLeadById({ where: { id: lead.id } }),
      ).rejects.toThrow(new NotFoundException(`Lead not found`))
    })
  })

  describe('get many leads', () => {
    it('should return leads succeed', async () => {
      const dto: DTO.Lead.GetManyQuery = {
        limit: 10,
        page: 1,
        shouldNotPaginate: false,
      }

      mockQueryBuilder.getMany.mockReturnValue([lead])

      expect(
        ((await leadService.getMany(dto)) as Pagination<Lead, IPaginationMeta>)
          .items,
      ).toEqual([lead])
    })
  })

  describe('update lead', () => {
    it('should update lead succeed', async () => {
      const dto: DTO.Lead.UpdateLead = {
        email: 'update@mail.com',
      }
      leadRepo.findOne.mockReturnValue({ ...lead })
      leadRepo.save.mockReturnValue({ ...lead, ...dto })

      expect(await leadService.updateLead(dto, lead.id)).toEqual({
        ...lead,
        ...dto,
      })
    })

    it('should throw not found exception when lead not found', async () => {
      const dto: DTO.Lead.UpdateLead = {
        email: 'update@mail.com',
      }

      leadRepo.findOne.mockReturnValue(undefined)

      expect(leadService.updateLead(dto, lead.id)).rejects.toThrow(
        new NotFoundException(`Lead not found`),
      )
    })
  })

  describe('convert lead', () => {
    it('should convert lead to account and contact succeed', async () => {
      const dto: DTO.Deal.ConvertToDeal = {
        fullName: deal.fullName,
        amount: deal.amount,
        closingDate: deal.closingDate,
        stage: deal.stage,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadRepo.findOne.mockReturnValue({ ...lead })
      accountRepo.save.mockReturnValue({ ...account })
      leadRepo.save.mockReturnValue({ ...contact })

      expect(await leadService.convert(lead.id, dto, false, undefined)).toEqual(
        [account, contact, null],
      )
    })

    it('should convert lead to deal succeed', async () => {
      const dto: DTO.Deal.ConvertToDeal = {
        fullName: deal.fullName,
        amount: deal.amount,
        closingDate: deal.closingDate,
        stage: deal.stage,
      }

      userRepo.findOne.mockReturnValue({ ...user })
      leadRepo.findOne.mockReturnValue({ ...lead })
      accountRepo.save.mockReturnValue({ ...account })
      leadRepo.save.mockReturnValue({ ...contact })
      accountRepo.findOne.mockReturnValue({ ...account })
      contactRepo.findOne.mockReturnValue({ ...contact })
      dealRepo.save.mockReturnValue({ ...deal })

      expect(await leadService.convert(lead.id, dto, true, undefined)).toEqual([
        account,
        contact,
        deal,
      ])
    })

    it('should throw not found exception when lead not found', async () => {
      const dto: DTO.Deal.ConvertToDeal = {
        fullName: deal.fullName,
        amount: deal.amount,
        closingDate: deal.closingDate,
        stage: deal.stage,
      }

      leadRepo.findOne.mockReturnValue(undefined)
      accountRepo.save.mockReturnValue({ ...account })
      contactRepo.save.mockReturnValue({ ...contact })
      dealRepo.save.mockReturnValue({ ...deal })

      expect(
        leadService.convert(lead.id, dto, true, undefined),
      ).rejects.toThrow(new NotFoundException(`Lead not found`))
    })

    it('should throw not found exception when try to convert a contact', async () => {
      const dto: DTO.Deal.ConvertToDeal = {
        fullName: deal.fullName,
        amount: deal.amount,
        closingDate: deal.closingDate,
        stage: deal.stage,
      }

      leadRepo.findOne.mockReturnValue(undefined)
      accountRepo.save.mockReturnValue({ ...account })
      contactRepo.save.mockReturnValue({ ...contact })
      dealRepo.save.mockReturnValue({ ...deal })

      expect(
        leadService.convert(contact.id, dto, true, undefined),
      ).rejects.toThrow(new NotFoundException(`Lead not found`))
    })
  })
})
