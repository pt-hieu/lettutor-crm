import { User } from "./user";

export interface Base {
  id: string
  updatedAt: Date
  createdAt: Date
  createdById: string | null
  updatedById: string | null
  createdBy: User
  updatedBy: User
}

