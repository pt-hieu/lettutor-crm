import { PickType } from '@nestjs/swagger'

import {
  Action,
  FactorType,
  Notification,
  TargetType,
} from './../../notification/notification.entity'

export class Create extends PickType(Notification, [
  'meta',
  'userId',
  'action',
  'factorIds',
  'factorType',
  'targetId',
  'targetType',
]) {}

export class CreateAssignEntityNoti extends Create {
  action: Action.ASSIGN_ENTITY
  factorType: FactorType.USER
  targetType: TargetType.ENTITY
  targetId: string
}

export class CreateChangeRoleNoti extends Create {
  action: Action.CHANGE_ROLE
  factorType: FactorType.USER
  targetType: undefined
  targetId: undefined
}
