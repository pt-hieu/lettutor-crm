import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Note } from 'src/note/note.entity'
import { Task } from 'src/task/task.entity'

import { LogController } from './log.controller'
import { Log } from './log.entity'
import { LogInterceptor } from './log.interceptor'
import { LogListener } from './log.listener'
import { LogService } from './log.service'

@Module({
  imports: [TypeOrmModule.forFeature([Log, Note, Task])],
  controllers: [LogController],
  providers: [LogService, LogListener, LogInterceptor],
})
export class LogModule {}
