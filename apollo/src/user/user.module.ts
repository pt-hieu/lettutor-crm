import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Action } from 'src/action/action.entity'
import { MailModule } from 'src/mail/mail.module'
import { NotificationModule } from 'src/notification/notification.module'
import { Role } from 'src/role/role.entity'
import { User } from 'src/user/user.entity'

import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Action]),
    MailModule,
    NotificationModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
