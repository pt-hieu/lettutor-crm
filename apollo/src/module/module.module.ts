import { Module as ModuleDecorator } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Action } from 'src/action/action.entity'

import { EntitySubscriber } from './entity.subscriber'
import { ModuleController } from './module.controller'
import { Entity, Module } from './module.entity'
import { ModuleService } from './module.service'
import { ModuleSubscriber } from './module.subscriber'

@ModuleDecorator({
  imports: [TypeOrmModule.forFeature([Module, Entity, Action])],
  providers: [ModuleService, EntitySubscriber, ModuleSubscriber],
  controllers: [ModuleController],
})
export class ModuleModule {}
