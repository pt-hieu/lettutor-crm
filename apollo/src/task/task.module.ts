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

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    AccountModule,
    UserModule,
    DealModule,
    ContactModule,
    forwardRef(() => LeadModule),
  ],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
