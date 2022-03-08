import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request as Req } from 'express'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest() as Req & { user: any }

    const isGoodApiKey = req.headers['x-api-key'] === process.env.API_KEY
    if (!isGoodApiKey) throw new BadRequestException('Bad API key')

    return true
  }
}
