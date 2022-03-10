import { QueryKey, useQuery } from 'react-query'

export function useStore<T>(key: QueryKey) {
  return useQuery<T>(key, { enabled: false })
}
