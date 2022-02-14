import { Injectable, MessageEvent } from '@nestjs/common'
import { BehaviorSubject } from 'rxjs'

@Injectable()
export class EventsService {
  $emitter: BehaviorSubject<MessageEvent>

  constructor() {
    this.$emitter = new BehaviorSubject<MessageEvent>({
      data: {
        opcode: 'connect successfully',
      },
    })
  }

  emit({ opcode, payload }: { opcode: string; payload?: unknown }) {
    this.$emitter.next({ data: { opcode, payload } })
    this.$emitter.next({ data: { opcode: 'connect successfully' } })
  }
}
