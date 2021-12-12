import { Module } from '@nestjs/common'
import { LeadService } from './lead.service'
import { LeadController } from './lead.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeadContact } from './lead-contact.entity'
import { AccountModule } from 'src/account/account.module'
import { ContactController } from './contact.controller'
import { ContactService } from './contact.service'
import { DealModule } from 'src/deal/deal.module'
import { UserModule } from 'src/user/user.module'

@Module({
  imports: [TypeOrmModule.forFeature([LeadContact]), AccountModule, DealModule, UserModule],
  providers: [LeadService, ContactService],
  controllers: [LeadController, ContactController],
})
export class LeadContactModule {}
