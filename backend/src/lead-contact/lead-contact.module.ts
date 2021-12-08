import { Module } from '@nestjs/common'
import { LeadContactService } from './lead-contact.service'
import { LeadContactController } from './lead-contact.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeadContact } from './lead-contact.entity'
import { AccountModule } from 'src/account/account.module'
import { ContactController } from './contact.controller'
import { ContactService } from './contact.service'

@Module({
  imports: [TypeOrmModule.forFeature([LeadContact]), AccountModule],
  providers: [LeadContactService, ContactService],
  controllers: [LeadContactController, ContactController],
})
export class LeadContactModule { }
