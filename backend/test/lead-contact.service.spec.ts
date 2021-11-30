import { DTO } from 'src/type'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { lead } from './data'
import { MockType, repositoryMockFactory } from './utils'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
import { LeadContactService } from 'src/lead-contact/lead-contact.service'

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
        leadStatus: lead.leadStatus,
        leadSource: lead.leadSource,
      }

      leadContactRepo.save.mockReturnValue({ ...lead })

      expect(await leadContactService.addLead(dto)).toEqual(lead)
    })
  })
})
