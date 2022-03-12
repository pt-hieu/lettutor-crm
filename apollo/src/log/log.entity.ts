import { Exclude } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Account } from 'src/account/account.entity'
import { Contact } from 'src/contact/contact.entity'
import { Deal } from 'src/deal/deal.entity'
import { Lead } from 'src/lead/lead.entity'
import { Task } from 'src/task/task.entity'
import { Ownerful } from 'src/utils/owner.entity'

// eslint-disable-next-line prettier/prettier

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

  @ManyToOne(() => Lead, (lead) => lead.logs, { onDelete: 'CASCADE' })
  @JoinColumn()
  lead: Lead

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  leadId: string | null

  @ManyToOne(() => Contact, (contact) => contact.logs, { onDelete: 'CASCADE' })
  @JoinColumn()
  contact: Contact

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  contactId: string | null

  @ManyToOne(() => Account, (account) => account.logs, { onDelete: 'CASCADE' })
  @JoinColumn()
  account: Account

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  accountId: string

  @ManyToOne(() => Deal, (deal) => deal.logs, { onDelete: 'CASCADE' })
  @JoinColumn()
  deal: Deal

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  dealId: string | null

  @ManyToOne(() => Task, (task) => task.logs, { onDelete: 'CASCADE' })
  @JoinColumn()
  task: Task

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  taskId: string | null

  @Column()
  entityName: string

  @Column()
  action: LogAction

  @Column({ default: false })
  deleted: boolean

  @Column({ type: 'jsonb', nullable: true })
  changes: TChange[] | null
}
