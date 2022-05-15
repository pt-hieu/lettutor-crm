import { HttpService } from '@nestjs/axios'
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm'

import { UtilService } from 'src/global/util.service'

import { File } from './file.entity'

@EventSubscriber()
export class FileSubscriber implements EntitySubscriberInterface<File> {
  constructor(
    connection: Connection,
    private util: UtilService,
    private http: HttpService,
  ) {
    connection.subscribers.push(this)
  }

  listenTo(): string | Function {
    return File
  }

  beforeRemove(event: RemoveEvent<File>): void | Promise<any> {
    if (!event.entity) return
    if (event.entity.external) return

    return this.util.wrap(
      this.http.delete(this.util.aresService + '/aws/s3', {
        data: {
          keys: [event.entity.key],
        },
      }),
    )
  }
}
