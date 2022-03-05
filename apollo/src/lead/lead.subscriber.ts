import { PayloadService } from 'src/global/payload.service'
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
import { Lead } from './lead.entity'

@EventSubscriber()
export class LeadSubscriber implements EntitySubscriberInterface<Lead> {
  constructor(
    connection: Connection,
    private util: UtilService,
    private payload: PayloadService,
  ) {
    connection.subscribers.push(this)
  }

  listenTo(): string | Function {
    return Lead
  }

  afterInsert(event: InsertEvent<Lead>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      ownerId: this.payload.data.id,
      source: LogSource.LEAD,
      action: LogAction.CREATE,
      changes: null,
    })
  }

  afterRemove(event: RemoveEvent<Lead>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.databaseEntity.id,
      ownerId: this.payload.data.id,
      source: LogSource.LEAD,
      action: LogAction.DELETE,
      changes: null,
    })
  }

  afterUpdate(event: UpdateEvent<Lead>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      ownerId: this.payload.data.id,
      source: LogSource.LEAD,
      action: LogAction.UPDATE,
      changes: this.util.compare(event.databaseEntity, event.entity),
    })
  }
}
