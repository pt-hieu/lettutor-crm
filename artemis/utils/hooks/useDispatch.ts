import { useCallback } from 'react'
import { QueryKey, useQueryClient } from 'react-query'

export function useDispatch() {
  const client = useQueryClient()

  return useCallback((key: QueryKey, payload?: any) => {
    client.setQueryData(key, payload ? { payload } : Date.now())
  }, [])
}
