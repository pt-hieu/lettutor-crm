import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { account, contact, deal, lead } from './data'
import { mockQueryBuilder, MockType, repositoryMockFactory } from './utils'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
import { LeadService } from 'src/lead-contact/lead.service'
import { NotFoundException } from '@nestjs/common'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { AccountService } from 'src/account/account.service'
import { Account } from 'src/account/account.entity'
import { DealService } from 'src/deal/deal.service'
import { Deal } from 'src/deal/deal.entity'

describe('lead-contact service', () => {
  let leadService: LeadService
  let leadContactRepo: MockType<Repository<LeadContact>>
  let accountService: AccountService
  let accountRepo: MockType<Repository<Account>>
  let dealService: DealService
  let dealRepo: MockType<Repository<Deal>>

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        DealService,
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
    leadService = ref.get(LeadService)
    accountService = ref.get(AccountService)
    dealService = ref.get(LeadService)
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

      leadContactRepo.save.mockReturnValue({ ...lead })

      expect(await leadService.addLead(dto)).toEqual(lead)
    })
  })

  describe('view lead detail', () => {
    it('should view lead detail succeed', async () => {
      leadContactRepo.findOne.mockReturnValue({ ...lead })

      expect(await leadService.getLeadById(lead.id)).toEqual(lead)
    })

    it('should throw exception when lead not found', async () => {
      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(leadService.getLeadById(lead.id)).rejects.toThrow(
        new NotFoundException(`Lead with ID ${lead.id} not found`),
      )
    })

    // it('should throw exception when try to view a contact', async () => {
    //   leadContactRepo.findOne.mockReturnValue({ ...contact })

    //   expect(leadService.getLeadById(lead.id)).rejects.toThrow(
    //     new NotFoundException(`Lead with ID ${lead.id} not found`),
    //   )
    // })
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
        (
          (await leadService.getMany(dto)) as Pagination<
            LeadContact,
            IPaginationMeta
          >
        ).items,
      ).toEqual([lead])
    })
  })

  describe('update lead', () => {
    it('should update lead succeed', async () => {
      const dto: DTO.Lead.UpdateLead = {
        email: 'update@mail.com',
      }
      leadContactRepo.findOne.mockReturnValue({ ...lead })
      leadContactRepo.save.mockReturnValue({ ...lead, ...dto })

      expect(await leadService.updateLead(dto, lead.id)).toEqual({
        ...lead,
        ...dto,
      })
    })

    it('should throw not found exception when lead not found', async () => {
      const dto: DTO.Lead.UpdateLead = {
        email: 'update@mail.com',
      }

      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(leadService.updateLead(dto, lead.id)).rejects.toThrow(
        new NotFoundException(`Lead with ID ${lead.id} not found`),
      )
    })
  })

  describe('convert lead', () => {
    it('should convert lead to account and contact succeed', async () => {
      leadContactRepo.findOne.mockReturnValue({ ...lead })

      accountRepo.save.mockReturnValue({ ...account })

      leadContactRepo.save.mockReturnValue({ ...contact })

      expect(await leadService.convert(lead.id, {})).toEqual([
        account,
        contact,
        null,
      ])
    })

    it('should convert lead to deal succeed', async () => {
      const dto: DTO.Deal.AddDeal = {
        fullName: deal.fullName,
        amount: deal.amount,
        closingDate: deal.closingDate,
        stage: deal.stage,
        source: deal.source,
        probability: deal.probability,
        description: deal.description,
      }

      leadContactRepo.findOne.mockReturnValue({ ...lead })

      accountRepo.save.mockReturnValue({ ...account })

      leadContactRepo.save.mockReturnValue({ ...contact })

      dealRepo.save.mockReturnValue({ ...deal })

      expect(await leadService.convert(lead.id, dto)).toEqual([
        account,
        contact,
        deal,
      ])
    })

    it('should throw not found exception when lead not found', async () => {
      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(leadService.convert(lead.id, {})).rejects.toThrow(
        new NotFoundException(`Lead with ID ${lead.id} not found`),
      )
    })

    it('should throw not found exception when try to convert a contact', async () => {
      leadContactRepo.findOne.mockReturnValue({ ...contact })

      expect(leadService.convert(contact.id, {})).rejects.toThrow(
        new NotFoundException(`Lead with ID ${contact.id} not found`),
      )
    })
  })
})
