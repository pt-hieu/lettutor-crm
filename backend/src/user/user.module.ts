import { MailModule } from 'src/mail/mail.module'
import { Role, User } from 'src/user/user.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { RoleController } from './role.controller'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), MailModule],
  providers: [UserService],
  controllers: [UserController, RoleController],
})
export class UserModule { }
