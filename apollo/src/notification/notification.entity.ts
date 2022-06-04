import { Exclude } from 'class-transformer'
import { Column, ManyToOne } from 'typeorm'

import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'

export enum FactorType {
  USER = 'User',
}

export enum TargetType {
  USER = 'User',
  ENTITY = 'ENTITY',
  ROLE = 'Role',
}

export enum Action {
  ASSIGN_ENTITY = 'Assign Entity',
  CHANGE_ROLE = 'Change Role',
}

export class Notification extends BaseEntity {
  @Column({ type: 'uuid' })
  @Exclude({ toPlainOnly: true })
  userId: string

  @ManyToOne(() => User)
  user: User

  @Column({ type: 'boolean', default: false })
  read: boolean

  @Column({ type: 'jsonb' })
  meta: Record<string, unknown>

  @Column({ type: 'uuid', array: true })
  factorIds: string[]

  @Column({ enum: FactorType })
  factorType: FactorType

  @Column({ enum: Action })
  action: Action

  @Column({ type: 'uuid', nullable: true })
  targetId: string | null

  @Column({ enum: TargetType, nullable: true })
  targetType: TargetType | null
}
