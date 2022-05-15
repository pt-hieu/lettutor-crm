import { Base } from './base'
import { Lead } from './lead'
import { Role } from './role'

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  UNCONFIRMED = 'Unconfirmed',
  DELETED = 'Deleted',
}

export interface User extends Base {
  name: string
  email: string
  password: string
  roles: Role[]
  status: UserStatus
  leadContacts: Lead[]
}
