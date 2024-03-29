import { useMemo } from 'react'

import { Paginate } from '@utils/models/paging'

export const usePaginateItem = <T>(response: Paginate<T> | undefined) => {
  const meta = response?.meta || {
    totalItems: 0,
    itemsPerPage: 0,
    currentPage: 0,
  }

  const { totalItems, itemsPerPage, currentPage } = meta

  const startIndex = useMemo(
    () => (currentPage - 1) * itemsPerPage + 1,
    [currentPage, itemsPerPage],
  )

  const endIndex = useMemo(
    () => Math.min(currentPage * itemsPerPage, totalItems),
    [currentPage, itemsPerPage, totalItems],
  )

  if (!response || !totalItems) return [0, 0, 0] as const
  return [startIndex, endIndex, totalItems] as const
}
