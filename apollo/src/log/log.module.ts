import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Account } from 'src/account/account.entity'
import { Contact } from 'src/contact/contact.entity'
import { Deal } from 'src/deal/deal.entity'
import { Lead } from 'src/lead/lead.entity'
import { Task } from 'src/task/task.entity'

import { LogController } from './log.controller'
import { Log } from './log.entity'
import { LogInterceptor } from './log.interceptor'
import { LogListener } from './log.listener'
import { LogService } from './log.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Log, Account, Contact, Lead, Deal, Task]),
  ],
  controllers: [LogController],
  providers: [LogService, LogListener, LogInterceptor],
})
export class LogModule {}
