import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { stringifyUrl } from 'query-string'

export type TUseQueryStateOptions = {
  isArray?: boolean
}

export const useQueryState = <T extends string | string[] | number>(
  /**The name of the query on the url */
  name: string,
  /**The default value which is given to the hook `setState`.
   * This value would be overwritten by the value of the query on url
   */
  defaultValue?: T,
  options?: TUseQueryStateOptions,
): [T | undefined, (v: T | undefined) => void] => {
  const memoizedOptions = useMemo(() => options, [])

  const { query, pathname, asPath, replace } = useRouter()
  const [state, setState] = useState<T>()

  const hasEffectRun = useRef(false)
  useEffect(() => {
    if (!hasEffectRun.current) return
    hasEffectRun.current = true

    if (query[name]) {
      let value = query[name]
      if (memoizedOptions?.isArray) {
        value = (value as string).split(',')
      }

      setState(value as unknown as T)
      return
    }

    setState(defaultValue)
  }, [query])

  const shouldUpdateUrl = useRef(false)
  useEffect(() => {
    let value = query[name]
    if (memoizedOptions?.isArray) {
      value = (value as string)?.split(',')
    }

    setState(value as unknown as T)
    shouldUpdateUrl.current = false
  }, [query])

  useEffect(() => {
    if (shouldUpdateUrl.current == false) return

    const newQuery = { ...query }

    if (state) {
      newQuery[name] = state + ''
    }

    if (!state && newQuery[name]) {
      delete newQuery[name]
    }

    const newPathname = stringifyUrl(
      {
        url: pathname,
        query: newQuery,
      },
      { encode: true },
    )

    const newAsPath = stringifyUrl(
      {
        url: asPath.split('?')[0],
        query: newQuery,
      },
      { encode: true },
    )

    replace(newPathname, newAsPath, { shallow: true })
  }, [state])

  const hookedSetState = useCallback((value: T | undefined) => {
    shouldUpdateUrl.current = true
    setState(value)
  }, [])

  return [state, hookedSetState]
}
