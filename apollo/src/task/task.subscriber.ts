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

import { Task } from './task.entity'

@EventSubscriber()
export class TaskSubscriber implements EntitySubscriberInterface<Task> {
  constructor(
    connection: Connection,
    private util: UtilService,
    private payload: PayloadService,
  ) {
    connection.subscribers.push(this)
  }

  listenTo(): string | Function {
    return Task
  }

  afterInsert(event: InsertEvent<Task>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: LogSource.TASK,
      action: LogAction.CREATE,
      changes: null,
    })
  }

  afterRemove(event: RemoveEvent<Task>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.databaseEntity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: LogSource.TASK,
      action: LogAction.DELETE,
      changes: null,
    })
  }

  afterSoftRemove(event: SoftRemoveEvent<Task>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.databaseEntity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: LogSource.TASK,
      action: LogAction.DELETE,
      changes: null,
    })
  }

  afterUpdate(event: UpdateEvent<Task>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: LogSource.TASK,
      action: LogAction.UPDATE,
      changes: this.util.compare(event.databaseEntity, event.entity),
    })
  }
}
