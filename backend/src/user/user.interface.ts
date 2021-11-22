import { Role } from 'src/user/user.entity'
export interface SimpleUser {
  email: string
  role: Role[]
  name: string
  type: number
}
