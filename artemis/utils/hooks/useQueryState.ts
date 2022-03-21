import { useCallback, useDebugValue, useEffect, useRef, useState } from 'react'
import { useQueryClient } from 'react-query'

import { useStore } from './useStore'

export const useQueryState = <T extends string | string[] | number | Date>(
  /**The name of the query on the url */
  name: string,
  /**The default value which is given to the hook `setState`.
   * This value would be overwritten by the value of the query on url
   */
  defaultValue?: T,
): [T | undefined, (v: T | undefined) => void] => {
  const [state, setState] = useState<T>()
  const client = useQueryClient()

  const { data: queryStore } =
    useStore<Record<string, unknown>>('store:query-store')

  const hasEffectRun = useRef(false)
  useEffect(() => {
    if (hasEffectRun.current) return

    if (!queryStore) return
    hasEffectRun.current = true

    if (queryStore[name]) return
    if (!defaultValue) return

    client.setQueryData('store:query-store', (oldQuery: any) => ({
      ...(oldQuery || {}),
      [name]: defaultValue,
    }))
  }, [queryStore])

  const hookedSetState = useCallback((value: T | undefined) => {
    client.setQueryData('store:query-store', (oldQuery: any) => ({
      ...(oldQuery || {}),
      [name]: value,
    }))

    setState(value)
  }, [])

  useDebugValue(state)
  return [state, hookedSetState]
}
