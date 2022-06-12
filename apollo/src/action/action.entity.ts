import { Column, Entity, ManyToMany } from 'typeorm'

import { Role } from 'src/role/role.entity'
import { BaseEntity } from 'src/utils/base.entity'

export enum ActionType {
  IS_ADMIN = 'Can do anything',
  IS_SALE = 'Can create any except user and role',
  CAN_VIEW_ALL = 'Can view all',
  CAN_VIEW_DETAIL_ANY = 'Can view detail any',
  CAN_VIEW_DETAIL_AND_EDIT_ANY = 'Can view detail and edit any',
  CAN_CREATE_NEW = 'Can create new',
  CAN_DELETE_ANY = 'Can delete any',
  CAN_RESTORE_REVERSED = 'Can restore reserved',
  CAN_CONVERT_ANY = 'Can convert any',
  CAN_CLOSE_ANY = 'Can close any',
  CAN_IMPORT_FROM_FILE = 'Can import from file',
  CAN_EXPORT_TO_FILE = 'Can export to file',
}

export enum DefaultActionTarget {
  ADMIN = 'admin',
  SALE = 'sale',
  USER = 'user',
  ROLE = 'role',
  TASK = 'task',
  NOTE = 'note',
  DEAL_STAGE = 'deal stage',
}

@Entity()
// @Unique(['target', 'type'])
export class Action extends BaseEntity {
  @Column()
  target: string

  @Column({
    enum: ActionType,
    type: 'enum',
  })
  type: ActionType

  @ManyToMany(() => Role, (r) => r.actions)
  roles: Role[]
}
