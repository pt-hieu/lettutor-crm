import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModule } from 'src/user/user.module'

import { TaskController } from './task.controller'
import { Task } from './task.entity'
import { TaskService } from './task.service'
import { TaskSubscriber } from './task.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([Task]), UserModule],
  providers: [TaskService, TaskSubscriber],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
