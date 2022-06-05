import { PickType } from '@nestjs/swagger'

import {
  Action,
  FactorType,
  Notification,
  TargetType,
} from 'src/notification/notification.entity'

import { Paginate } from './paging'

export class GetManyNotification extends Paginate {}

export class CreateNotification extends PickType(Notification, [
  'meta',
  'userId',
  'action',
  'factorIds',
  'factorType',
  'targetId',
  'targetType',
]) {}

export class CreateAssignEntityNoti extends CreateNotification {
  action: Action.ASSIGN_ENTITY
  factorType: FactorType.USER
  targetType: TargetType.ENTITY
  targetId: string
}

export class CreateChangeRoleNoti extends CreateNotification {
  action: Action.CHANGE_ROLE
  factorType: FactorType.USER
  targetType: undefined
  targetId: undefined
}
