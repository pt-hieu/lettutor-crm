import { Role } from "./user";

export interface JwtPayload {
  id: string
  role: Role[]
  email: string
  name: string
}