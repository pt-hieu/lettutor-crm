import { Module as ModuleDecorator } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CsvModule } from 'nest-csv-parser'

import { Action } from 'src/action/action.entity'
import { DealStage } from 'src/deal-stage/deal-stage.entity'
import { File } from 'src/file/file.entity'
import { Note } from 'src/note/note.entity'
import { NoteModule } from 'src/note/note.module'
import { UserModule } from 'src/user/user.module'

import { NotificationModule } from './../notification/notification.module'
import { EntitySubscriber } from './entity.subscriber'
import { ModuleController } from './module.controller'
import { Entity, Module } from './module.entity'
import { ModuleService } from './module.service'
import { ModuleSubscriber } from './module.subscriber'

@ModuleDecorator({
  imports: [
    TypeOrmModule.forFeature([Module, Entity, Action, File, Note, DealStage]),
    UserModule,
    NoteModule,
    CsvModule,
    NotificationModule,
  ],
  providers: [ModuleService, EntitySubscriber, ModuleSubscriber],
  controllers: [ModuleController],
  exports: [ModuleService],
})
export class ModuleModule {}
