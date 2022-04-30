import { useEffect } from 'react'
import { useFirstMountState } from 'react-use'

import { useStore } from './useStore'

export function useCommand<T = unknown>(
  command: string,
  effect: (pl?: { payload: T }) => void,
) {
  const { data } = useStore<{ payload: T }>(command)
  const isFirstMount = useFirstMountState()

  useEffect(() => {
    if (isFirstMount) return
    return effect(data)
  }, [data])
}
