import { JwtPayload } from '@utils/models/payload'
import { Actions } from '@utils/models/role'
import { getSession } from 'next-auth/client'

export async function checkActionError(req: any, ...actions: Actions[]) {
  const session = (await getSession({ req })) as { user: JwtPayload }

  if (!session) return true
  return !actions.filter((action) =>
    session.user.roles.some(
      (role) =>
        role.actions.includes(action) ||
        role.actions.includes(Actions.IS_ADMIN),
    ),
  ).length
}
