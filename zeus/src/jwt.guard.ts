import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { isObservable, lastValueFrom } from 'rxjs'

import { PUBLIC_ROUTES } from './publics'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request

    /** @example /apollo/lead */
    const path = req.path
    const method = req.method.toLocaleLowerCase()

    const isPublic = PUBLIC_ROUTES.some(
      (route) => path.includes(route.value) && method === route.method,
    )

    let canActivate = false
    try {
      const result = super.canActivate(context)

      if (typeof result === 'boolean') {
        canActivate = result
      } else if (isObservable(result)) {
        canActivate = await lastValueFrom(result)
      } else {
        canActivate = await result
      }
    } catch (e) {}

    if (!isPublic && !canActivate) {
      throw new UnauthorizedException('Zeus')
    }

    return isPublic || canActivate
  }
}
