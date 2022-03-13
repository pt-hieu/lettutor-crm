import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Account } from 'src/account/account.entity'
import { AccountModule } from 'src/account/account.module'
import { Contact } from 'src/contact/contact.entity'
import { ContactModule } from 'src/contact/contact.module'
import { Deal } from 'src/deal/deal.entity'
import { DealModule } from 'src/deal/deal.module'
import { Lead } from 'src/lead/lead.entity'
import { LeadModule } from 'src/lead/lead.module'
import { Task } from 'src/task/task.entity'
import { TaskModule } from 'src/task/task.module'

import { LogController } from './log.controller'
import { Log } from './log.entity'
import { LogInterceptor } from './log.interceptor'
import { LogListener } from './log.listener'
import { LogService } from './log.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Log, Account, Contact, Lead, Deal, Task]),
    forwardRef(() => TaskModule),
    forwardRef(() => AccountModule),
    forwardRef(() => ContactModule),
    forwardRef(() => DealModule),
    forwardRef(() => LeadModule),
  ],
  controllers: [LogController],
  providers: [LogService, LogListener, LogInterceptor],
})
export class LogModule {}
