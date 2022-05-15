import { Base } from './base'
import { User } from './user'

export enum ActionType {
  IS_ADMIN = 'Can do anything',
  CAN_VIEW_ALL = 'Can view all',
  CAN_VIEW_DETAIL_ANY = 'Can view detail any',
  CAN_VIEW_DETAIL_AND_EDIT_ANY = 'Can view detail and edit any',
  CAN_CREATE_NEW = 'Can create new',
  CAN_DELETE_ANY = 'Can delete any',
  CAN_RESTORE_REVERSED = 'Can restore reserved',
  CAN_CONVERT_ANY = 'Can convert any',
  CAN_CLOSE_ANY = 'Can close any',
}

export enum DefaultModule {
  USER = 'user',
  ROLE = 'role',
  TASK = 'task',
  NOTE = 'note',
  DEAL_STAGE = 'deal stage',
}

export type Action = {
  id: string
  target: string
  type: ActionType
}

export interface Role extends Base {
  name: string
  actions: Action[]
  parent: Role
  children: Role[]
  users: User[]
  usersCount?: number
  default: boolean
}
