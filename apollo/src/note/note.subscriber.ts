import { HttpService } from '@nestjs/axios'
import { UtilService } from 'src/global/util.service'
import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  RemoveEvent,
} from 'typeorm'
import { Note } from './note.entity'

@EventSubscriber()
export class NoteSubscriber implements EntitySubscriberInterface<Note> {
  constructor(
    connection: Connection,
    private http: HttpService,
    private util: UtilService,
  ) {
    connection.subscribers.push(this)
  }

  listenTo(): string | Function {
    return Note
  }

  beforeRemove(event: RemoveEvent<Note>): void | Promise<any> {
    if (!event.entity) return
    return this.util.wrap(
      this.http.delete(this.util.aresService + '/aws/s3', {
        data: {
          keys: event.entity.files.map((file) => file.key),
        },
      }),
    )
  }
}
