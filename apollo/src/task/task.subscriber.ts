import { UtilService } from 'src/global/util.service'
import { LogAction, LogSource } from 'src/log/log.entity'
import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm'
import { Task } from './task.entity'

@EventSubscriber()
export class TaskSubscriber implements EntitySubscriberInterface<Task> {
  constructor(connection: Connection, private util: UtilService) {
    connection.subscribers.push(this)
  }

  listenTo(): string | Function {
    return Task
  }

  afterInsert(event: InsertEvent<Task>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      source: LogSource.TASK,
      action: LogAction.CREATE,
      changes: null,
    })
  }

  afterRemove(event: RemoveEvent<Task>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      source: LogSource.TASK,
      action: LogAction.DELETE,
      changes: null,
    })
  }

  afterUpdate(event: UpdateEvent<Task>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      source: LogSource.TASK,
      action: LogAction.UPDATE,
      changes: this.util.compare(event.databaseEntity, event.entity),
    })
  }
}
