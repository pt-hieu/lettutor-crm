import { useQuery } from 'react-query'

import { GlobalState } from '@utils/GlobalStateKey'
import { ActionType, DefaultModule } from '@utils/models/role'

export type UseAuthorizationReturnType = Partial<Record<string, boolean>>

export const useAuthorization = () => {
  const { data } = useQuery<UseAuthorizationReturnType>(
    GlobalState.AUTHORIZATION,
    { enabled: false },
  )

  return (action: ActionType, moduleName?: DefaultModule | string) =>
    (data || {})[action + ' ' + moduleName]
}
