import { Column, Entity, OneToMany } from 'typeorm'

import { Comment } from 'src/feed/comment.entity'
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
  NOTE = 'note',
  MODULE = 'module',
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity()
export class Log extends Ownerful {
  @Column()
  source: LogSource | string

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

  @OneToMany(() => Comment, (comment) => comment.log, {
    eager: true,
    cascade: true,
  })
  comments?: Comment[]
}
