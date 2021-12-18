import { ChangeEvent, useCallback, useState } from "react"

export const useInput = <T>(init: T) => {
  const [state, setState] = useState(init)

  const onChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setState(e.target.value as unknown as T)
  }, [])

  return [state, onChangeHandler] as const
}