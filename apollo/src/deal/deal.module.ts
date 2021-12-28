import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountModule } from 'src/account/account.module'
import { LeadContactModule } from 'src/lead-contact/lead-contact.module'
import { NoteModule } from 'src/note/note.module'
import { UserModule } from 'src/user/user.module'
import { DealController } from './deal.controller'
import { Deal } from './deal.entity'
import { DealService } from './deal.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal]),
    AccountModule,
    UserModule,
    forwardRef(() => NoteModule),
    forwardRef(() => LeadContactModule),
  ],
  controllers: [DealController],
  providers: [DealService],
  exports: [DealService],
})
export class DealModule {}
