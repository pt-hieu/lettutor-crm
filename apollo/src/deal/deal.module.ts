import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AccountModule } from 'src/account/account.module'
import { ContactModule } from 'src/contact/contact.module'
import { LeadModule } from 'src/lead/lead.module'
import { NoteModule } from 'src/note/note.module'
import { UserModule } from 'src/user/user.module'

import { DealController } from './deal.controller'
import { Deal } from './deal.entity'
import { DealService } from './deal.service'
import { DealSubscriber } from './deal.subscriber'

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal]),
    AccountModule,
    UserModule,
    forwardRef(() => NoteModule),
    forwardRef(() => LeadModule),
    forwardRef(() => ContactModule),
  ],
  controllers: [DealController],
  providers: [DealService, DealSubscriber],
  exports: [DealService],
})
export class DealModule {}
