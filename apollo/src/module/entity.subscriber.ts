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
import { LogAction } from 'src/log/log.entity'

import { Entity } from './module.entity'
import { ModuleService } from './module.service'

@EventSubscriber()
export class EntitySubscriber implements EntitySubscriberInterface<Entity> {
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
    return Entity
  }

  async afterInsert(event: InsertEvent<Entity>): Promise<any> {
    if (!event.entity) return
    const module = await this.service.getOneModule(event.entity.moduleId)

    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: module.name,
      action: LogAction.CREATE,
      changes: null,
    })
  }

  async afterRemove(event: RemoveEvent<Entity>): Promise<any> {
    if (!event.entity) return
    const module = await this.service.getOneModule(event.entity.moduleId)

    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: module.name,
      action: LogAction.DELETE,
      changes: null,
    })
  }

  async afterSoftRemove(event: SoftRemoveEvent<Entity>): Promise<any> {
    if (!event.entity) return
    const module = await this.service.getOneModule(event.entity.moduleId)

    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: module.name,
      action: LogAction.DELETE,
      changes: null,
    })
  }

  async afterUpdate(event: UpdateEvent<Entity>): Promise<any> {
    if (!event.entity) return
    const module = await this.service.getOneModule(event.entity.moduleId)

    const changes = this.util.compare(event.databaseEntity, event.entity, [
      'data',
    ])

    const dataChanges = this.util.compare(
      event.databaseEntity.data,
      event.entity.data,
    )

    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: module.name,
      action: LogAction.UPDATE,
      changes: [...changes, ...dataChanges],
    })
  }
}
