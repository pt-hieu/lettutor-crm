import { Role } from '@/user/user.entity'
import { Request } from 'express';

export interface JwtPayload {
  sub: string
  iat: number
  role: Role[]
  email: string
  name: string
}

export interface AuthRequest extends Request {
  user: JwtPayload
}