export interface StrapiEntity<T> {
  id: string
  attributes: T
}

export interface StrapiTimestamp {
  updatedAt: Date
  createdAt: Date
  publishedAt: Date
}

export interface StrapiResponse<T> {
  data: Array<T> | T
  meta: {
    pagination?: {
      page: number
      pageCount: number
      pageSize: number
      total: number
    }
  }
}

export interface ParsedResponses<T> {
  items: T
  meta: TMeta
}

export type TMeta = Partial<{
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}>
