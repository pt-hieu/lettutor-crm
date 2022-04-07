import { useEffect } from 'react'
import { useQueryClient } from 'react-query'
import { usePrevious } from 'react-use'

export const useObjectQuery = (object: object) => {
  const previousObj = usePrevious(object)
  const client = useQueryClient()

  useEffect(() => {
    if (!previousObj) {
      Object.entries(object).forEach(([key, value]) => {
        client.setQueryData('store:query-store', (oldQuery: any) => ({
          ...(oldQuery || {}),
          [key]: value,
        }))
      })
    }

    ;[...Object.keys(previousObj || {}), ...Object.keys(object)].forEach(
      (key) => {
        client.setQueryData('store:query-store', (oldQuery: any) => ({
          ...(oldQuery || {}),
          // @ts-ignore
          [key]: object[key],
        }))
      },
    )
  }, [object])
}
