import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { isObservable, lastValueFrom } from 'rxjs'
import { PayloadService } from './global/payload.service'
import { IS_PUBLIC_KEY } from './utils/decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly payloadService: PayloadService,
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

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

    if (!canActivate) {
      this.payloadService.data = undefined
    }

    return !!isPublic || canActivate
  }
}
