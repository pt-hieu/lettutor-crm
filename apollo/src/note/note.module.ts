import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DealModule } from 'src/deal/deal.module'
import { UserModule } from 'src/user/user.module'
import { NoteController } from './note.controller'
import { Note } from './note.entity'
import { NoteService } from './note.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Note]),
    UserModule,
    forwardRef(() => DealModule),
  ],
  controllers: [NoteController],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule { }
