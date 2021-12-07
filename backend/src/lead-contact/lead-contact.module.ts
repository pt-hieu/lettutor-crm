import { Module } from '@nestjs/common'
import { LeadContactService } from './lead-contact.service'
import { LeadContactController } from './lead-contact.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeadContact } from './lead-contact.entity'
import { AccountModule } from 'src/account/account.module'

@Module({
  imports: [TypeOrmModule.forFeature([LeadContact]), AccountModule],
  providers: [LeadContactService],
  controllers: [LeadContactController],
})
export class LeadContactModule {}
