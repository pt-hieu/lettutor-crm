import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountModule } from 'src/account/account.module'
import { DealModule } from 'src/deal/deal.module'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
import { LeadController } from 'src/lead-contact/lead.controller'
import { LeadService } from 'src/lead-contact/lead.service'
import { UserModule } from 'src/user/user.module'
import { WebhookController } from '../webhook/webhook.controller'
import { WebhookService } from './webhook.service'

@Module({
  imports: [TypeOrmModule.forFeature([LeadContact]), AccountModule, DealModule, UserModule, HttpModule],
  providers: [LeadService, WebhookService],
  controllers: [LeadController, WebhookController],
})
export class WebhookModule { }
