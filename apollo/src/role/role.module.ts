import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Action } from 'src/action/action.entity'
import { ActionModule } from 'src/action/action.module'

import { RoleController } from './role.controller'
import { Role } from './role.entity'
import { RoleService } from './role.service'
import { RoleSubscriber } from './role.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([Role, Action]), ActionModule],
  controllers: [RoleController],
  providers: [RoleService, RoleSubscriber],
})
export class RoleModule {}
