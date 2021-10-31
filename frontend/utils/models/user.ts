import { Base } from './base'

export interface User extends Base {
  name: string
  email: string
  password: string
  role: string
}
