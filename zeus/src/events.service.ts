import { Injectable, MessageEvent } from '@nestjs/common'
import { Subject } from 'rxjs'

@Injectable()
export class EventsService {
  $emitter: Subject<MessageEvent>
  public subjectMap: Map<string, Subject<MessageEvent>>

  constructor() {
    this.$emitter = new Subject<MessageEvent>()
    this.subjectMap = new Map<string, Subject<MessageEvent>>()
  }

  emit({ opcode, payload }: { opcode: string; payload?: unknown }) {
    this.$emitter.next({ data: { opcode, payload } })
  }

  emitNotification(dto: any) {
    this.subjectMap.get(dto.userId)?.next(dto)
  }
}
