import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AccountModule } from 'src/account/account.module'
import { ContactModule } from 'src/contact/contact.module'
import { DealModule } from 'src/deal/deal.module'
import { TaskModule } from 'src/task/task.module'
import { UserModule } from 'src/user/user.module'

import { LeadController } from './lead.controller'
import { Lead } from './lead.entity'
import { LeadService } from './lead.service'
import { LeadSubscriber } from './lead.subscriber'

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]),
    AccountModule,
    UserModule,
    forwardRef(() => DealModule),
    forwardRef(() => ContactModule),
    forwardRef(() => TaskModule),
  ],
  providers: [LeadService, LeadSubscriber],
  controllers: [LeadController],
  exports: [LeadService],
})
export class LeadModule {}
