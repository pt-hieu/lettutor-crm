import { useCallback, useState } from "react"

export const useModal = () => {
  const [state, setState] = useState(false)

  const open = useCallback(() => setState(true), [])
  const close = useCallback(() => setState(false), [])

  return [state, open, close] as const
}