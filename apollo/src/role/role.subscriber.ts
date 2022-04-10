import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm'

import { Role } from './role.entity'

export enum DefaultRoleName {
  ADMIN = 'Admin',
  SALE = 'Sale',
}

@EventSubscriber()
export class RoleSubscriber implements EntitySubscriberInterface<Role> {
  constructor(connection: Connection) {
    connection.subscribers.push(this)
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  listenTo(): string | Function {
    return Role
  }

  // beforeInsert(event: InsertEvent<Role>): void | Promise<any> {
  //   if (
  //     Object.values(DefaultRoleName).some((name) => name === event.entity.name)
  //   ) {
  //     event.entity.default = true
  //     event.entity.actions = RoleActionMapping[event.entity.name]
  //   }
  // }
}
