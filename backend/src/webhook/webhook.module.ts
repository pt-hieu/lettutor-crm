import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { LeadService } from 'src/lead-contact/lead.service'
import { WebhookController } from '../webhook/webhook.controller'
import { WebhookService } from './webhook.service'

@Module({
  imports: [LeadService, HttpModule],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
