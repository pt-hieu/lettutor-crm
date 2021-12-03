import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { lead } from './data'
import { MockType, repositoryMockFactory } from './utils'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
import { LeadContactService } from 'src/lead-contact/lead-contact.service'
import { NotFoundException } from '@nestjs/common'

describe('lead-contact service', () => {
  let leadContactRepo: MockType<Repository<LeadContact>>
  let leadContactService: LeadContactService

  beforeEach(async () => {
    const ref: TestingModule = await Test.createTestingModule({
      providers: [
        LeadContactService,
        {
          provide: getRepositoryToken(LeadContact),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile()

    leadContactRepo = ref.get(getRepositoryToken(LeadContact))
    leadContactService = ref.get(LeadContactService)
  })

  describe('add lead', () => {
    it('should add lead succeed', async () => {
      const dto: DTO.LeadContact.AddLead = {
        ownerId: lead.ownerId,
        fullName: lead.fullName,
        email: lead.email,
        status: lead.status,
        source: lead.source,
      }

      leadContactRepo.save.mockReturnValue({ ...lead })

      expect(await leadContactService.addLead(dto)).toEqual(lead)
    })
  })

  describe('view lead detail', () => {
    it('should view lead detail succeed', async () => {
      leadContactRepo.findOne.mockReturnValue({ ...lead })

      expect(await leadContactService.getLeadById(lead.id)).toEqual(lead)
    })

    it('should throw exception when lead not found', async () => {
      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(leadContactService.getLeadById(lead.id)).rejects.toThrow(
        new NotFoundException(`Lead with ID ${lead.id} not found`),
      )
    })
  })

  describe('update lead', () => {
    it('should update lead succeed', async () => {
      const dto: DTO.LeadContact.UpdateLead = {
        email: "update@mail.com"
      }
      leadContactRepo.findOne.mockReturnValue({ ...lead })
      leadContactRepo.save.mockReturnValue({ ...lead, ...dto })

      expect(await leadContactService.updateLead(dto, lead.id)).toEqual({ ...lead, ...dto })
    })

    it('should throw not found exception when lead not found', async () => {
      const dto: DTO.LeadContact.UpdateLead = {
        email: "update@mail.com"
      }

      leadContactRepo.findOne.mockReturnValue(undefined)

      expect(leadContactService.updateLead(dto, lead.id)).rejects.toThrow(
        new NotFoundException(`Lead does not exist`)
      )
    })
  })
})
