import { HttpService } from '@nestjs/axios'
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm'
import { SoftRemoveEvent } from 'typeorm/subscriber/event/SoftRemoveEvent'

import { PayloadService } from 'src/global/payload.service'
import { UtilService } from 'src/global/util.service'
import { LogAction, LogSource } from 'src/log/log.entity'

import { Note } from './note.entity'

@EventSubscriber()
export class NoteSubscriber implements EntitySubscriberInterface<Note> {
  constructor(
    connection: Connection,
    private http: HttpService,
    private util: UtilService,
    private payload: PayloadService,
  ) {
    connection.subscribers.push(this)
  }

  listenTo(): string | Function {
    return Note
  }

  beforeRemove(event: RemoveEvent<Note>): void | Promise<any> {
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

  afterInsert(event: InsertEvent<Note>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.title || 'Untitle Note',
      ownerId: this.payload.data.id,
      source: LogSource.NOTE,
      action: LogAction.CREATE,
      changes: null,
    })
  }

  afterRemove(event: RemoveEvent<Note>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.databaseEntity.id,
      entityName: event.entity.title || 'Untitled Note',
      ownerId: this.payload.data.id,
      source: LogSource.NOTE,
      action: LogAction.DELETE,
      changes: null,
    })
  }

  afterSoftRemove(event: SoftRemoveEvent<Note>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.databaseEntity.id,
      entityName: event.entity.title || 'Untitled Note',
      ownerId: this.payload.data.id,
      source: LogSource.NOTE,
      action: LogAction.DELETE,
      changes: null,
    })
  }

  afterUpdate(event: UpdateEvent<Note>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.title || 'Untitled Note',
      ownerId: this.payload.data.id,
      source: LogSource.NOTE,
      action: LogAction.UPDATE,
      changes: this.util.compare(event.databaseEntity, event.entity),
    })
  }
}
