import { MailModule } from 'src/mail/mail.module'
import { User } from 'src/user/user.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { Role } from 'src/role/role.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), MailModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
