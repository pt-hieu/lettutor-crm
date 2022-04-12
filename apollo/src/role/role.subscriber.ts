import { InjectRepository } from '@nestjs/typeorm'
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  Repository,
} from 'typeorm'

import {
  Action,
  ActionType,
  DefaultActionTarget,
} from 'src/action/action.entity'
import { ActionService } from 'src/action/action.service'

import { Role } from './role.entity'

export enum DefaultRoleName {
  ADMIN = 'Admin',
  SALE = 'Sale',
}

@EventSubscriber()
export class RoleSubscriber implements EntitySubscriberInterface<Role> {
  constructor(
    connection: Connection,
    @InjectRepository(Action) private actionRepo: Repository<Action>,
  ) {
    connection.subscribers.push(this)
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  listenTo(): string | Function {
    return Role
  }

  async beforeInsert(event: InsertEvent<Role>): Promise<any> {
    if (
      Object.values(DefaultRoleName).some((name) => name === event.entity.name)
    ) {
      event.entity.default = true
      if (event.entity.name === DefaultRoleName.ADMIN) {
        event.entity.actions = [
          await this.actionRepo.findOne({
            where: {
              target: DefaultActionTarget.ADMIN,
              type: ActionType.IS_ADMIN,
            },
          }),
        ]
      } else if (event.entity.name === DefaultRoleName.SALE) {
        event.entity.actions = (
          await this.actionRepo.find({
            where: { type: ActionType.CAN_CREATE_NEW },
          })
        ).filter(
          ({ target }) =>
            target !== DefaultActionTarget.USER &&
            target !== DefaultActionTarget.ROLE,
        )
      }
    }
  }
}
