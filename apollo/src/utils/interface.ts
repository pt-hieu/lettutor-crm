import { Request } from 'express'
import { Role } from 'src/user/user.entity'

export interface JwtPayload {
  id: string
  email: string
  name: string
  roles: Role[]
}

export interface AuthRequest extends Request {
  user: JwtPayload
}
