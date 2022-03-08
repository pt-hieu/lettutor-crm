import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AccountModule } from 'src/account/account.module'
import { ContactModule } from 'src/contact/contact.module'
import { DealModule } from 'src/deal/deal.module'
import { LeadModule } from 'src/lead/lead.module'
import { UserModule } from 'src/user/user.module'

import { TaskController } from './task.controller'
import { Task } from './task.entity'
import { TaskService } from './task.service'
import { TaskSubscriber } from './task.subscriber'

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    AccountModule,
    UserModule,
    forwardRef(() => DealModule),
    forwardRef(() => LeadModule),
    forwardRef(() => ContactModule),
  ],
  providers: [TaskService, TaskSubscriber],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
