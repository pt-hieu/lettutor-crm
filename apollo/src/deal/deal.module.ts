import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountModule } from 'src/account/account.module'
import { ContactModule } from 'src/contact/contact.module'
import { LeadModule } from 'src/lead/lead.module'
import { UserModule } from 'src/user/user.module'
import { DealController } from './deal.controller'
import { Deal } from './deal.entity'
import { DealService } from './deal.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal]),
    AccountModule,
    UserModule,
    forwardRef(() => LeadModule),
    forwardRef(() => ContactModule),
  ],
  controllers: [DealController],
  providers: [DealService],
  exports: [DealService],
})
export class DealModule {}
