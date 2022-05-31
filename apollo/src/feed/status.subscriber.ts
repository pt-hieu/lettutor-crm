import { HttpService } from '@nestjs/axios'
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm'

import { UtilService } from 'src/global/util.service'

import { Status } from './status.entity'

@EventSubscriber()
export class NoteSubscriber implements EntitySubscriberInterface<Status> {
  constructor(
    connection: Connection,
    private http: HttpService,
    private util: UtilService,
  ) {
    connection.subscribers.push(this)
  }

  listenTo(): string | Function {
    return Status
  }

  beforeRemove(event: RemoveEvent<Status>): void | Promise<any> {
    if (!event.entity) return
    if (!event.entity.attachments.length) return

    return this.util.wrap(
      this.http.delete(this.util.aresService + '/aws/s3', {
        data: {
          keys: event.entity.attachments.map((file) => file.key),
        },
      }),
    )
  }
}
