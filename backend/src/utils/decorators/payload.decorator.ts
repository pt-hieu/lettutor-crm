import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtPayload } from '../interface'

export const Payload = createParamDecorator(
  (_data, ctx: ExecutionContext): JwtPayload => {
    const req = ctx.switchToHttp().getRequest()
    return req.user
  },
)
