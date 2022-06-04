import { EventEmitter2 } from '@nestjs/event-emitter'
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'

import { Notification } from './notification.entity'
import { RenderService } from './render.service'

@EventSubscriber()
export class NotificationSubscriber
  implements EntitySubscriberInterface<Notification>
{
  constructor(
    connection: Connection,
    private eventEmitter: EventEmitter2,
    private render: RenderService,
  ) {
    connection.subscribers.push(this)
  }

  listenTo(): string | Function {
    return Notification
  }

  afterInsert(event: InsertEvent<Notification>): void | Promise<any> {
    if (!event.entity) return
    this.eventEmitter.emit('noti.created', {
      ...event.entity,
      message: this.render.renderNotification(event.entity),
    })
  }
}
