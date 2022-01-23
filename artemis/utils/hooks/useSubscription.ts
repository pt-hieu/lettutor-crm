import { GlobalState } from '@utils/GlobalStateKey'
import { MessageData } from '@utils/models/subscription'
import { useQuery } from 'react-query'

export function useSubscription() {
  const { data } = useQuery<MessageData>(GlobalState.SUBSCRIPTION, {
    enabled: false,
  })

  return data
}
