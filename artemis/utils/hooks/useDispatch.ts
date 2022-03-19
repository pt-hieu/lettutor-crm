import { useCallback } from 'react'
import { QueryKey, useQueryClient } from 'react-query'

export function useDispatch() {
  const client = useQueryClient()
  return useCallback((key: QueryKey) => {
    client.setQueryData(key, Date.now())
  }, [])
}
