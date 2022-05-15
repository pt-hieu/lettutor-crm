import { HttpModule } from '@nestjs/axios'
import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { File } from 'src/file/file.entity'
import { FileModule } from 'src/file/file.module'
import { Entity } from 'src/module/module.entity'
import { TaskModule } from 'src/task/task.module'

import { NoteController } from './note.controller'
import { Note } from './note.entity'
import { NoteService } from './note.service'
import { NoteSubscriber } from './note.subscriber'

@Module({
  imports: [
    TypeOrmModule.forFeature([Note, File, Entity]),
    forwardRef(() => TaskModule),
    FileModule,
    HttpModule,
  ],
  controllers: [NoteController],
  providers: [NoteService, NoteSubscriber],
  exports: [NoteService],
})
export class NoteModule {}
