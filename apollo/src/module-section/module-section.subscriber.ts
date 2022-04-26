import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'

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
  constructor(conection: Connection, private service: ModuleService) {
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
  }
}
