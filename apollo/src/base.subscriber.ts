import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
} from 'typeorm'
import { PayloadService } from './global/payload.service'
import { BaseEntity } from './utils/base.entity'

@EventSubscriber()
export class BaseSubscriber implements EntitySubscriberInterface<BaseEntity> {
  constructor(
    connection: Connection,
    private readonly payloadService: PayloadService,
  ) {
    connection.subscribers.push(this)
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  listenTo(): string | Function {
    return BaseEntity
  }

  beforeInsert(event: InsertEvent<BaseEntity>): void | Promise<any> {
    event.entity.createdById = this.payloadService.data?.id || null
    event.entity.createdAt = new Date()
  }

  beforeUpdate(event: UpdateEvent<BaseEntity>): void | Promise<any> {
    if (event.entity) {
      event.entity.updatedById = this.payloadService.data?.id || null
      event.entity.updatedAt = new Date()
    }
  }
}
