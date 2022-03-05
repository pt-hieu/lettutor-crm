import { forwardRef, Module } from '@nestjs/common'
import { LeadService } from './lead.service'
import { LeadController } from './lead.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Lead } from './lead.entity'
import { AccountModule } from 'src/account/account.module'
import { DealModule } from 'src/deal/deal.module'
import { UserModule } from 'src/user/user.module'
import { ContactModule } from 'src/contact/contact.module'
import { TaskModule } from 'src/task/task.module'
import { LeadSubscriber } from './lead.subscriber'

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]),
    AccountModule,
    UserModule,
    forwardRef(() => DealModule),
    ContactModule,
    forwardRef(() => TaskModule),
  ],
  providers: [LeadService, LeadSubscriber],
  controllers: [LeadController],
  exports: [LeadService],
})
export class LeadModule {}
