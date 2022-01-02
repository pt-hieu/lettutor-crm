import { GlobalState } from '@utils/GlobalStateKey'
import { Actions } from '@utils/models/role'
import { useQuery } from 'react-query'

export type UseAuthorizationReturnType = Partial<Record<Actions, boolean>>

export const useAuthorization = (): UseAuthorizationReturnType => {
  const { data } = useQuery<UseAuthorizationReturnType>(
    GlobalState.AUTHORIZATION,
    { enabled: false },
  )

  return data || {}
}
