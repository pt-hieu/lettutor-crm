import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { stringifyUrl } from 'query-string'

export const useQueryState = <Type>(
  name: string,
): [Type | undefined, Dispatch<SetStateAction<Type | undefined>>] => {
  const { query, pathname, asPath, replace } = useRouter()

  const [state, setState] = useState(query[name] as unknown as Type | undefined)

  useEffect(() => {
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

  return [state, setState]
}
