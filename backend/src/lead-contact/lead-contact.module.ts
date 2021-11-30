import { Module } from '@nestjs/common'
import { LeadContactService } from './lead-contact.service'
import { LeadContactController } from './lead-contact.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeadContact } from './lead-contact.entity'

@Module({
  imports: [TypeOrmModule.forFeature([LeadContact])],
  providers: [LeadContactService],
  controllers: [LeadContactController],
})
export class LeadContactModule {}
