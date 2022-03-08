import { useQuery } from 'react-query'

import { GlobalState } from '@utils/GlobalStateKey'
import { MessageData } from '@utils/models/subscription'

export function useSubscription() {
  const { data } = useQuery<MessageData>(GlobalState.SUBSCRIPTION, {
    enabled: false,
  })

  return data
}
