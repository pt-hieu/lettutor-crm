import { HttpModule } from '@nestjs/axios'
import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ContactModule } from 'src/contact/contact.module'
import { DealModule } from 'src/deal/deal.module'
import { File } from 'src/file/file.entity'
import { FileModule } from 'src/file/file.module'

import { NoteController } from './note.controller'
import { Note } from './note.entity'
import { NoteService } from './note.service'
import { NoteSubscriber } from './note.subscriber'

@Module({
  imports: [
    TypeOrmModule.forFeature([Note, File]),
    forwardRef(() => ContactModule),
    forwardRef(() => DealModule),
    FileModule,
    HttpModule,
  ],
  controllers: [NoteController],
  providers: [NoteService, NoteSubscriber],
  exports: [NoteService],
})
export class NoteModule {}
