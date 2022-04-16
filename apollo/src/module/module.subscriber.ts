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

import { Module } from './module.entity'
import { ModuleService } from './module.service'

@EventSubscriber()
export class ModuleSubscriber implements EntitySubscriberInterface<Module> {
  constructor(
    conection: Connection,
    private util: UtilService,
    private payload: PayloadService,
  ) {
    conection.subscribers.push(this)
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  listenTo(): string | Function {
    return Module
  }

  async afterInsert(event: InsertEvent<Module>): Promise<any> {
    if (!event.entity) return

    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload?.data?.id,
      source: LogSource.MODULE,
      action: LogAction.CREATE,
      changes: null,
    })
  }

  async afterRemove(event: RemoveEvent<Module>): Promise<any> {
    if (!event.entity) return

    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: LogSource.MODULE,
      action: LogAction.DELETE,
      changes: null,
    })
  }
  async afterSoftRemove(event: SoftRemoveEvent<Module>): Promise<any> {
    if (!event.entity) return

    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: LogSource.MODULE,
      action: LogAction.DELETE,
      changes: null,
    })
  }

  async afterUpdate(event: UpdateEvent<Module>): Promise<any> {
    if (!event.entity) return
    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: LogSource.MODULE,
      action: LogAction.UPDATE,
      changes: this.util.compare(event.databaseEntity, event.entity, ['meta']),
    })
  }
}
