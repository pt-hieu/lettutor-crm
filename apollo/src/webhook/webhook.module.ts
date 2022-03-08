import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Lead } from 'src/lead/lead.entity'
import { LeadModule } from 'src/lead/lead.module'

import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'

@Module({
  imports: [TypeOrmModule.forFeature([Lead]), LeadModule, HttpModule],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
