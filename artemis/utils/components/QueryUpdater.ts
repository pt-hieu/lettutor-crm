import { useRouter } from 'next/router'
import { stringifyUrl } from 'query-string'
import { useEffect } from 'react'
import { useQueryClient } from 'react-query'

import { useStore } from '@utils/hooks/useStore'

export default function QueryUpdater() {
  const { query, pathname, replace, asPath } = useRouter()

  const client = useQueryClient()
  const { data: queryStore } =
    useStore<Record<string, unknown>>('store:query-store')

  useEffect(() => {
    client.setQueryData('store:query-store', (old: any) => ({
      ...(old || {}),
      ...query,
    }))
  }, [pathname])

  useEffect(() => {
    const newQuery = { ...(queryStore || {}) } as Record<string, string>

    Object.entries(queryStore || {}).forEach(([key, value]) => {
      if (Array.isArray(value) && !value.length) delete newQuery[key]
      else if (typeof value === 'string' && !value) delete newQuery[key]
      else if (key === 'id' || key === 'path') delete newQuery[key]
    })

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
  }, [queryStore])

  return null
}
