export interface Paginate<T> {
  items: Array<T>
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}

export type PagingQuery = {
  page?: number
  limit?: number
  shouldNotPaginate?: boolean
}

export interface StrapiPaginate<T> {
  data: Array<T>
  meta: {
    pagination: {
      page: number
      pageCount: number
      pageSize: number
      total: number
    }
  }
}
