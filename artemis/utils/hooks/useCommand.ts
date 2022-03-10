import { EffectCallback, useEffect } from 'react'
import { useFirstMountState } from 'react-use'

import { useStore } from './useStore'

export function useCommand(command: string, effect: EffectCallback) {
  const { data } = useStore(command)
  const isFirstMount = useFirstMountState()

  useEffect(() => {
    if (isFirstMount) return
    return effect()
  }, [data])
}
