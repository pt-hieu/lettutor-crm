/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { PayloadService } from './payload.service'

const cookieExtractor = function (req: Request) {
  let token = null

  if (req && req.cookies) {
    token =
      req.cookies['next-auth.session-token'] ||
      req.cookies['__Secure-next-auth.session-token']
  }

  return token
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly payloadService: PayloadService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: any) {
    this.payloadService.data = payload
    return payload
  }
}
