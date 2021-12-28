import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { KEY } from './action.decorator'
import { Actions } from './type/action'
import { JwtPayload } from './utils/interface'

@Injectable()
export class ActionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAction = this.reflector.getAllAndOverride<Actions>(KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredAction) {
      return true
    }

    const { user } = context.switchToHttp().getRequest() as { user: JwtPayload }

    return user.roles.some(
      ({ actions }) =>
        actions.includes(Actions.IS_ADMIN) || actions.includes(requiredAction),
    )
  }
}
