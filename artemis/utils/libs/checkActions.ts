import { getSession } from 'next-auth/client'

import { JwtPayload } from '@utils/models/payload'
import { ActionValues, Actions } from '@utils/models/role'

export async function checkActionError(req: any, ...actions: ActionValues[]) {
  const session = (await getSession({ req })) as { user: JwtPayload }

  if (!session) return true
  return !actions.filter((action) =>
    session.user.roles.some(
      (role) =>
        role.actions.includes(action) ||
        role.actions.includes(Actions.Admin.IS_ADMIN),
    ),
  ).length
}
