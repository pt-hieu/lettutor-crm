import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { stringifyUrl } from 'query-string'

export type UseQueryStateOptions = { isArray?: boolean; subscribe?: boolean }

export const useQueryState = <Type>(
  name: string,
  option?: UseQueryStateOptions,
): [Type | undefined, Dispatch<SetStateAction<Type | undefined>>] => {
  const { query, pathname, asPath, replace } = useRouter()

  const [state, setState] = useState(() => {
    if (option?.isArray) {
      return (query[name] as string | undefined)?.split(',') as unknown as
        | Type
        | undefined
    }

    return query[name] as unknown as Type | undefined
  })

  useEffect(() => {
    const newQuery = { ...query }

    if (state) {
      newQuery[name] = state + ''
    }

    if (option?.isArray && !(state as Array<Type> | undefined)?.length) {
      delete newQuery[name]
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

  useEffect(() => {
    if (!option?.subscribe) return
    setState(() => {
      if (option?.isArray) {
        return (query[name] as string | undefined)?.split(',') as unknown as
          | Type
          | undefined
      }

      return query[name] as unknown as Type | undefined
    })
  }, [query[name]])

  return [state, setState]
}
