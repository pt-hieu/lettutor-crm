import { Role } from 'src/user/user.entity'
import { Request } from 'express';

export interface JwtPayload {
  id: string
  role: Role[]
  email: string
  name: string
}

export interface AuthRequest extends Request {
  user: JwtPayload
}