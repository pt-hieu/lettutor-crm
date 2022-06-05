import { useSession } from 'next-auth/client'

import { JwtPayload } from '@utils/models/payload'

type UseSessionReturnType =
  | [{ user: JwtPayload; exp?: any; accessToken: string }, false]
  | [null, true]

export const useTypedSession = () => {
  const [session, loading] = useSession()

  return [session, loading] as UseSessionReturnType
}
