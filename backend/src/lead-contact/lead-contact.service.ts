import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { Repository } from 'typeorm'
import { LeadContact } from './lead-contact.entity'

@Injectable()
export class LeadContactService {
  constructor(
    @InjectRepository(LeadContact)
    private leadContactRepo: Repository<LeadContact>,
  ) {}

  async addLead(dto: DTO.LeadContact.AddLead) {
    return this.leadContactRepo.save(dto)
  }
}
