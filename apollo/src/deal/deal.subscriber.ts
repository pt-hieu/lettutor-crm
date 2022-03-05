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
import { Deal } from './deal.entity'

@EventSubscriber()
export class DealSubscriber implements EntitySubscriberInterface<Deal> {
  constructor(
    connection: Connection,
    private util: UtilService,
    private payload: PayloadService,
  ) {
    connection.subscribers.push(this)
  }

  listenTo(): string | Function {
    return Deal
  }

  afterInsert(event: InsertEvent<Deal>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      ownerId: this.payload.data.id,
      source: LogSource.DEAL,
      action: LogAction.CREATE,
      changes: null,
    })
  }

  afterRemove(event: RemoveEvent<Deal>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      ownerId: this.payload.data.id,
      source: LogSource.DEAL,
      action: LogAction.DELETE,
      changes: null,
    })
  }

  afterUpdate(event: UpdateEvent<Deal>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      ownerId: this.payload.data.id,
      source: LogSource.DEAL,
      action: LogAction.UPDATE,
      changes: this.util.compare(event.databaseEntity, event.entity),
    })
  }
}
