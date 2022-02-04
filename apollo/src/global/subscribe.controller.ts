import { Controller, MessageEvent, Sse } from '@nestjs/common'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'
import { BehaviorSubject } from 'rxjs'
import { EmitterService } from './emitter.service'

@Controller('subscribe')
@ApiTags('subscribe')
@ApiSecurity('x-api-key')
@ApiSecurity('x-user')
export class SubscribeController {
  constructor(private readonly service: EmitterService) {}

  @Sse()
  subscribe(): BehaviorSubject<MessageEvent> {
    return this.service.$emitter
  }
}
