import { isEqual } from 'lodash'
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
import {
  Action,
  FactorType,
  TargetType,
} from 'src/notification/notification.entity'

import { FieldType } from './../../../artemis/utils/models/module'
import { NotificationService } from './../notification/notification.service'
import { Entity } from './module.entity'
import { ModuleService } from './module.service'

@EventSubscriber()
export class EntitySubscriber implements EntitySubscriberInterface<Entity> {
  constructor(
    conection: Connection,
    private util: UtilService,
    private payload: PayloadService,
    private service: ModuleService,
    private notiService: NotificationService,
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

    module.meta.forEach((field) => {
      if (
        field.type === FieldType.RELATION &&
        field.relateTo === 'user' &&
        event.entity.data[field.name]
      ) {
        ;[event.entity.data[field.name]].flat().forEach((userId: string) => {
          this.notiService.createAssignEntityNoti({
            userId,
            action: Action.ASSIGN_ENTITY,
            targetId: event.entity.id,
            targetType: TargetType.ENTITY,
            meta: {
              module: module.name,
            },
            factorType: FactorType.USER,
            factorIds: [this.payload.data.id],
          })
        })
      }
    })

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
      'module',
    ])

    const dataChanges = this.util.compare(
      event.databaseEntity.data,
      event.entity.data,
      ['tasks'],
    )

    module.meta.forEach((field) => {
      if (
        field.type === FieldType.RELATION &&
        field.relateTo === 'user' &&
        !isEqual(
          event.entity.data[field.name],
          event.databaseEntity.data[field.name],
        )
      ) {
        ;[event.entity.data[field.name]].flat().forEach((userId: string) => {
          this.notiService.createAssignEntityNoti({
            userId,
            action: Action.ASSIGN_ENTITY,
            targetId: event.entity.id,
            targetType: TargetType.ENTITY,
            meta: {
              module: module.name,
            },
            factorType: FactorType.USER,
            factorIds: [this.payload.data.id],
          })
        })
      }
    })

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
