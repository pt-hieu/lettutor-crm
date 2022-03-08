import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModule } from 'src/user/user.module'

import { AccountController } from './account.controller'
import { Account } from './account.entity'
import { AccountService } from './account.service'
import { AccountSubscriber } from './account.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([Account]), UserModule],
  providers: [AccountService, AccountSubscriber],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
