import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Entity } from 'src/module/module.entity'

import { TaskController } from './task.controller'
import { Task } from './task.entity'
import { TaskService } from './task.service'
import { TaskSubscriber } from './task.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([Task, Entity])],
  providers: [TaskService, TaskSubscriber],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
