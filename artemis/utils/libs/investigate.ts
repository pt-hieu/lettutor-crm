import { QueryClient, QueryKey } from 'react-query'

type InvestigateReturnType = {
  isError: boolean
}

export const investigate = (
  client: QueryClient,
  ...keys: QueryKey[]
): InvestigateReturnType => {
  const data = keys.map((key) => client.getQueryCache().find(key)?.state.data)

  return {
    isError: data.some((d) => !d),
  }
}
