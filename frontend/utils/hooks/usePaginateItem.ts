import { Paginate } from '@utils/models/paging'
import { useMemo } from 'react'

export const usePaginateItem = <T>(response: Paginate<T> | undefined) => {
  if (!response) return [0, 0] as const

  const {
    meta: { totalItems, itemsPerPage, currentPage },
  } = response

  const startIndex = useMemo(
    () => (currentPage - 1) * itemsPerPage,
    [currentPage, itemsPerPage],
  )

  const endIndex = useMemo(() => {
    Math.min(currentPage * itemsPerPage, totalItems)
  }, [currentPage, itemsPerPage, totalItems])

  return [startIndex, endIndex] as const
}
