import { Module } from '@nestjs/common'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Task } from './task.entity'
import { AccountModule } from 'src/account/account.module'
import { UserModule } from 'src/user/user.module'
import { DealModule } from 'src/deal/deal.module'
import { LeadContactModule } from 'src/lead-contact/lead-contact.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    AccountModule,
    UserModule,
    DealModule,
    LeadContactModule,
  ],
  providers: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
