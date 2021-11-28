import { Base } from './base'

export enum Role {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
}

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
  role: Role[]
  status: UserStatus
}
