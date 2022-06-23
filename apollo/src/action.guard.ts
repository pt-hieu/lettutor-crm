import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { KEY } from './action.decorator'
import { ActionType, DefaultActionTarget } from './action/action.entity'
import { JwtPayload } from './utils/interface'

@Injectable()
export class ActionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredActions = this.reflector.getAllAndOverride<
      { target: string; type: ActionType }[]
    >(KEY, [context.getHandler(), context.getClass()])

    if (!requiredActions) {
      return true
    }

    const { user } = context.switchToHttp().getRequest() as { user: JwtPayload }

    return !!requiredActions.filter((requiredAction) =>
      user.roles.some(({ actions }) =>
        actions.some(
          ({ type, target }) =>
            (target === requiredAction.target &&
              type === requiredAction.type) ||
            (target === DefaultActionTarget.ADMIN &&
              type === ActionType.IS_ADMIN) ||
            (target === DefaultActionTarget.SALE &&
              type === ActionType.IS_SALE &&
              requiredAction.type === ActionType.CAN_CREATE_NEW &&
              requiredAction.target !== DefaultActionTarget.ROLE &&
              requiredAction.target !== DefaultActionTarget.USER),
        ),
      ),
    ).length
  }
}
