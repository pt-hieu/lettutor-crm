import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
} from 'typeorm'
import { PayloadService } from './payload.service'
import { BaseEntity } from './utils/base.entity'

@EventSubscriber()
export class BaseSubscriber implements EntitySubscriberInterface<BaseEntity> {
  constructor(
    connection: Connection,
    private readonly payloadService: PayloadService,
  ) {
    connection.subscribers.push(this)
  }

  listenTo(): string | Function {
    return BaseEntity
  }

  beforeInsert(event: InsertEvent<BaseEntity>): void | Promise<any> {
    event.entity.createdBy = this.payloadService.data?.id || null
    event.entity.createdAt = new Date()
  }

  beforeUpdate(event: UpdateEvent<BaseEntity>): void | Promise<any> {
    event.entity.updatedBy = this.payloadService.data?.id || null
    event.entity.updatedAt = new Date()
  }
}
