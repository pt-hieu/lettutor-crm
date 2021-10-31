export enum Role {
  SUPER_ADMIN = 'super admin'
}

export interface JwtPayload {
  id: string
  role: Role[]
  email: string
  name: string
}