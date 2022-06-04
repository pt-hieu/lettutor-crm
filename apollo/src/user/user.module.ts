import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MailModule } from 'src/mail/mail.module'
import { Role } from 'src/role/role.entity'
import { User } from 'src/user/user.entity'

import { NotificationModule } from './../notification/notification.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    MailModule,
    NotificationModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
