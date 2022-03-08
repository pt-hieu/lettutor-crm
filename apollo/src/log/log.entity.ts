import { Column, Entity } from 'typeorm'

import { Ownerful } from 'src/utils/owner.entity'

export type TChange = {
  name: string
  from: string | number
  to: string | number
}

export enum LogSource {
  LEAD = 'lead',
  ACCOUNT = 'account',
  CONTACT = 'contact',
  DEAL = 'deal',
  TASK = 'task',
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity()
export class Log extends Ownerful {
  @Column()
  source: LogSource

  @Column({ type: 'uuid' })
  entityId: string

  @Column()
  entityName: string

  @Column()
  action: LogAction

  @Column({ default: false })
  deleted: boolean

  @Column({ type: 'jsonb', nullable: true })
  changes: TChange[] | null
}
