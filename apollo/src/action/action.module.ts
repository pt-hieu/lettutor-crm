import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ActionController } from './action.controller'
import { Action } from './action.entity'
import { ActionService } from './action.service'

@Module({
  imports: [TypeOrmModule.forFeature([Action])],
  providers: [ActionService],
  controllers: [ActionController],
  exports: [ActionService],
})
export class ActionModule {}
