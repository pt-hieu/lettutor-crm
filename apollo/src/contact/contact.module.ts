import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountModule } from 'src/account/account.module'
import { ContactController } from './contact.controller'
import { ContactService } from './contact.service'
import { DealModule } from 'src/deal/deal.module'
import { UserModule } from 'src/user/user.module'
import { Contact } from './contact.entity'
import { ContactSubscriber } from './contact.subscriber'

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
    AccountModule,
    UserModule,
    forwardRef(() => DealModule),
  ],
  providers: [ContactService, ContactSubscriber],
  controllers: [ContactController],
  exports: [ContactService],
})
export class ContactModule {}
