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
    private service: ModuleService,
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

    // const changes = this.util.compare(
    //   event.databaseEntity.meta,
    //   event.entity.meta,
    // )

    // const descripChange = this.util.compareEntity(
    //   event.databaseEntity.description,
    //   event.entity.description,
    //   'description',
    // )
    // if (descripChange) changes.unshift(descripChange)

    // const nameChange = this.util.compareEntity(
    //   event.databaseEntity.name,
    //   event.entity.name,
    //   'name',
    // )
    // if (nameChange) changes.unshift(nameChange)
    const changes = this.util.compare(event.databaseEntity, event.entity)

    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: LogSource.MODULE,
      action: LogAction.UPDATE,
      changes: changes,
    })
  }
}
