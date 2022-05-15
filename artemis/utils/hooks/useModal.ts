import { useCallback, useDebugValue, useState } from 'react'

export const useModal = () => {
  const [state, setState] = useState(false)
  useDebugValue(state)

  const open = useCallback(() => setState(true), [])
  const close = useCallback(() => setState(false), [])

  const toggle = useCallback(() => setState((s) => !s), [])

  return [state, open, close, toggle] as const
}
