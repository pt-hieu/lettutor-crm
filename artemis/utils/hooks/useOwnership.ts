import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { Deal } from '@utils/models/deal'
import { Lead } from '@utils/models/lead'
import { JwtPayload } from '@utils/models/payload'
import { Task } from '@utils/models/task'
import { getSession } from 'next-auth/client'
import { QueryClient, QueryKey } from 'react-query'
import { useTypedSession } from './useTypedSession'

type Entity = Lead | Account | Contact | Deal | Task

export function useOwnership(entity: Entity | undefined) {
  const [session] = useTypedSession()
  const { owner } = entity || {}

  return owner?.id === session?.user.id
}

export async function useServerSideOwnership(req: any, client: QueryClient, key: QueryKey) {
  const session = (await getSession({ req })) as { user: JwtPayload }
  const { owner } =
    (client.getQueryCache().find(key)?.state.data as Entity | undefined) || {}

  return owner?.id === session.user.id
}
