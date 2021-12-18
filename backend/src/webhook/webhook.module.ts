import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
import { LeadContactModule } from 'src/lead-contact/lead-contact.module'
import { WebhookController } from '../webhook/webhook.controller'
import { WebhookService } from './webhook.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([LeadContact]),
    LeadContactModule,
    HttpModule,
  ],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
