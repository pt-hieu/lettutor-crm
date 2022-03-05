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
import { Account } from './account.entity'

@EventSubscriber()
export class AccountSubscriber implements EntitySubscriberInterface<Account> {
  constructor(
    connection: Connection,
    private util: UtilService,
    private payload: PayloadService,
  ) {
    connection.subscribers.push(this)
  }

  listenTo(): string | Function {
    return Account
  }

  afterInsert(event: InsertEvent<Account>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      ownerId: this.payload.data.id,
      source: LogSource.ACCOUNT,
      action: LogAction.CREATE,
      changes: null,
    })
  }

  afterRemove(event: RemoveEvent<Account>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.databaseEntity.id,
      ownerId: this.payload.data.id,
      source: LogSource.ACCOUNT,
      action: LogAction.DELETE,
      changes: null,
    })
  }

  afterUpdate(event: UpdateEvent<Account>): void | Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      ownerId: this.payload.data.id,
      source: LogSource.ACCOUNT,
      action: LogAction.UPDATE,
      changes: this.util.compare(event.databaseEntity, event.entity),
    })
  }
}
