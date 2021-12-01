import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DTO } from 'src/type'
import { JwtPayload } from 'src/utils/interface'
import { Repository } from 'typeorm'
import { LeadContact } from './lead-contact.entity'

@Injectable()
export class LeadContactService {
  constructor(
    @InjectRepository(LeadContact)
    private leadContactRepo: Repository<LeadContact>,
  ) {}

  async getLeadById(id: string) {
    return this.leadContactRepo.findOne({ id })
  }

  async addLead(dto: DTO.LeadContact.AddLead) {
    return this.leadContactRepo.save(dto)
  }
}
