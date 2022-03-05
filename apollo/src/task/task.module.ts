import { forwardRef, Module } from '@nestjs/common'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Task } from './task.entity'
import { AccountModule } from 'src/account/account.module'
import { UserModule } from 'src/user/user.module'
import { DealModule } from 'src/deal/deal.module'
import { LeadModule } from 'src/lead/lead.module'
import { ContactModule } from 'src/contact/contact.module'
import { TaskSubscriber } from './task.subscriber'

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    AccountModule,
    UserModule,
    forwardRef(() => DealModule),
    forwardRef(() => LeadModule),
    ContactModule,
  ],
  providers: [TaskService, TaskSubscriber],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
