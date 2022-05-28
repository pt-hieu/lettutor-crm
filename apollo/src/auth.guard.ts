import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request as Req } from 'express'

import { PayloadService } from './global/payload.service'
import { IS_PUBLIC_KEY } from './utils/decorators/public.decorator'
import { JwtPayload } from './utils/interface'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly payloadService: PayloadService,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])

    let canActivate = false
    const req = ctx.switchToHttp().getRequest() as Req & { user: any }

    const isGoodApiKey = req.headers['x-api-key'] === process.env.API_KEY
    if (!isGoodApiKey) throw new BadRequestException('Bad API key')

    try {
      const payload = JSON.parse(req.headers['x-user'] as string) as JwtPayload

      req.user = payload
      canActivate = true
      
      this.payloadService.data = payload
    } catch (e) {
      this.payloadService.data = undefined
    }

    if (!isPublic && !canActivate) throw new UnauthorizedException()
    return isPublic || canActivate
  }
}
