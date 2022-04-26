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
import { ModuleService } from 'src/module/module.service'

import { Section } from './module-section.entity'

export const default_section = [
  'Deal Information',
  'Lead Information',
  'Contact Information',
  'Account Information',
]

@EventSubscriber()
export class SectionSubscriber implements EntitySubscriberInterface<Section> {
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
    return Section
  }

  async afterInsert(event: InsertEvent<Section>): Promise<any> {
    if (!event.entity) return
    if (
      default_section.find((e) => e === event.entity.name) &&
      event.entity.moduleId === null
    ) {
      this.service.updateDefaultSection(event.entity)
    }

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

  async afterRemove(event: RemoveEvent<Section>): Promise<any> {
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

  async afterSoftRemove(event: SoftRemoveEvent<Section>): Promise<any> {
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

  async afterUpdate(event: UpdateEvent<Section>): Promise<any> {
    if (!event.entity) return
    const module = await this.service.getOneModule(event.entity.moduleId)

    return this.util.emitLog({
      entityId: event.entity.id,
      entityName: event.entity.name,
      ownerId: this.payload.data.id,
      source: module.name,
      action: LogAction.UPDATE,
      changes: this.util.compare(event.databaseEntity, event.entity),
    })
  }
}
