import { Module } from '@nestjs/common'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Account } from './account.entity'
import { UserModule } from 'src/user/user.module'
import { AccountSubscriber } from './account.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([Account]), UserModule],
  providers: [AccountService, AccountSubscriber],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
