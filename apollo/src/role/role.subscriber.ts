import { Actions } from 'src/type/action'
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

export const RoleActionMapping: Record<DefaultRoleName, Actions[]> = {
  [DefaultRoleName.ADMIN]: [Actions.IS_ADMIN],
  [DefaultRoleName.SALE]: [
    Actions.CREATE_NEW_TASK,
    Actions.CREATE_NEW_ACCOUNT,
    Actions.CREATE_NEW_CONTACT,
    Actions.CREATE_NEW_DEAL,
    Actions.CREATE_NEW_LEAD,
  ],
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

  beforeInsert(event: InsertEvent<Role>): void | Promise<any> {
    if (
      Object.values(DefaultRoleName).some((name) => name === event.entity.name)
    ) {
      event.entity.default = true
      event.entity.actions = RoleActionMapping[event.entity.name]
    }
  }
}
