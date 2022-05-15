import { Role } from './role'

export interface JwtPayload {
  id: string
  roles: Role[]
  email: string
  name: string
}
