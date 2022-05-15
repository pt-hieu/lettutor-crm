import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DealStage } from 'src/deal-stage/deal-stage.entity'
import { Note } from 'src/note/note.entity'
import { Task } from 'src/task/task.entity'

import { LogController } from './log.controller'
import { Log } from './log.entity'
import { LogListener } from './log.listener'
import { LogService } from './log.service'

@Module({
  imports: [TypeOrmModule.forFeature([Log, Note, Task, DealStage])],
  controllers: [LogController],
  providers: [LogService, LogListener],
})
export class LogModule {}
