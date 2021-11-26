import { Base } from './base'

export enum Role {
  SUPER_ADMIN = "super admin"
}

export interface User extends Base {
  name: string
  email: string
  password: string
  role: string
}
