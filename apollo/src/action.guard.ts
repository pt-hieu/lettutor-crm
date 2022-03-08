import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { KEY } from './action.decorator'
import { Actions } from './type/action'
import { JwtPayload } from './utils/interface'

@Injectable()
export class ActionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredActions = this.reflector.getAllAndOverride<Actions[]>(KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredActions) {
      return true
    }

    const { user } = context.switchToHttp().getRequest() as { user: JwtPayload }

    return !!requiredActions.filter((action) =>
      user.roles.some(
        ({ actions }) =>
          actions.includes(action) || actions.includes(Actions.IS_ADMIN),
      ),
    ).length
  }
}
