import { useEffect, useRef } from 'react'

export function useSpecialEffect(func: () => () => void, deps: any[]) {
  const ref = useRef(true)

  useEffect(() => {
    if (ref.current) {
      ref.current = false
      return
    }

    return func()
  }, deps)
}
