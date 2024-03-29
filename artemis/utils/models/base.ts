import { User } from './user'

export interface Base {
  id: string
  updatedAt: Date
  createdAt: Date
  createdById: string | null
  updatedById: string | null
  createdBy: User | null
  updatedBy: User | null
}

export interface StrapiBase {
  id: string

  updatedAt: Date
  createdAt: Date
  publishedAt: Date
}
