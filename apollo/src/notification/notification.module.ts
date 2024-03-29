import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Entity } from 'src/module/module.entity'
import { Role } from 'src/role/role.entity'
import { User } from 'src/user/user.entity'

import { NotificationController } from './notification.controller'
import { Notification } from './notification.entity'
import { NotificationService } from './notification.service'
import { NotificationSubscriber } from './notification.subscriber'
import { RenderService } from './render.service'

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, Role, Entity])],
  providers: [NotificationService, RenderService, NotificationSubscriber],
  exports: [NotificationService, RenderService],
  controllers: [NotificationController],
})
export class NotificationModule {}
