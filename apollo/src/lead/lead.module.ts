import { forwardRef, Module } from '@nestjs/common'
import { LeadService } from './lead.service'
import { LeadController } from './lead.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Lead } from './lead.entity'
import { AccountModule } from 'src/account/account.module'
import { DealModule } from 'src/deal/deal.module'
import { UserModule } from 'src/user/user.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]),
    AccountModule,
    UserModule,
    forwardRef(() => DealModule),
  ],
  providers: [LeadService],
  controllers: [LeadController],
  exports: [LeadService],
})
export class LeadModule {}
