import { Controller, MessageEvent, Sse } from '@nestjs/common'
import { BehaviorSubject } from 'rxjs'
import { EmitterService } from './emitter.service'

@Controller('subscribe')
export class SubscribeController {
  constructor(private readonly service: EmitterService) {}

  @Sse()
  subscribe(): BehaviorSubject<MessageEvent> {
    return this.service.$emitter
  }
}
