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


export interface Strapi<T> {
  id: string
  attributes: T
}

export interface StrapiTimestamp {
  updatedAt: Date
  createdAt: Date
  publishedAt: Date
}
