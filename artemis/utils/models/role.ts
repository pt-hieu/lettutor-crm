import { Base } from './base'
import { User } from './user'

export enum Actions {
  // ====================== ADMIN ====
  IS_ADMIN = 'Can do anything',
  TSET = 'Test'
}

export interface Role extends Base {
  name: string
  actions: Actions[]
  parent: Role
  children: Role[]
  users: User[]
  usersCount?: number
}
