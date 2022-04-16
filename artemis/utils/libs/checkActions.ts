import { getSession } from 'next-auth/client'

import { JwtPayload } from '@utils/models/payload'
import { ActionType } from '@utils/models/role'

export async function checkActionError(
  req: any,
  ...actions: { action: ActionType; moduleName: string }[]
) {
  const session = (await getSession({ req })) as { user: JwtPayload }

  if (!session) return true

  return !actions.filter(({ action, moduleName }) =>
    session.user.roles.some(
      (role) =>
        role.actions.some(({ type }) => type === ActionType.IS_ADMIN) ||
        role.actions.some(
          ({ type, target }) => type === action && target === moduleName,
        ),
    ),
  ).length
}
