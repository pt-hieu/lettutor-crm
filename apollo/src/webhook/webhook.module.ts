import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ModuleModule } from 'src/module/module.module'

import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'

@Module({
  imports: [HttpModule, ModuleModule],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
