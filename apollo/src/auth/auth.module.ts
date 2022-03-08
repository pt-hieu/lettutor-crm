import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Role } from 'src/role/role.entity'
import { User } from 'src/user/user.entity'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
