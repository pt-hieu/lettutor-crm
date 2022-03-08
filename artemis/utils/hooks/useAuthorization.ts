import { useQuery } from 'react-query'

import { GlobalState } from '@utils/GlobalStateKey'

export type UseAuthorizationReturnType = Partial<Record<string, boolean>>

export const useAuthorization = (): UseAuthorizationReturnType => {
  const { data } = useQuery<UseAuthorizationReturnType>(
    GlobalState.AUTHORIZATION,
    { enabled: false },
  )

  return data || {}
}
