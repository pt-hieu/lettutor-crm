import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountModule } from 'src/account/account.module'
import { ContactModule } from 'src/contact/contact.module'
import { DealModule } from 'src/deal/deal.module'
import { FileModule } from 'src/file/file.module'
import { LeadModule } from 'src/lead/lead.module'
import { UserModule } from 'src/user/user.module'
import { NoteController } from './note.controller'
import { Note } from './note.entity'
import { NoteService } from './note.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Note]),
    UserModule,
    forwardRef(() => LeadModule),
    forwardRef(() => ContactModule),
    forwardRef(() => AccountModule),
    forwardRef(() => DealModule),
    FileModule,
  ],
  controllers: [NoteController],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}
