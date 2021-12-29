import { Account } from 'src/account/account.entity'
import { Contact } from 'src/contact/contact.entity'
import { Deal } from 'src/deal/deal.entity'
import { Lead } from 'src/lead/lead.entity'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

export enum TaskPriority {
  HIGH = 'High',
  HIGHEST = 'Highest',
  LOW = 'Low',
  LOWEST = 'Lowest',
  NORMAL = 'Normal',
}

export enum TaskStatus {
  NOT_STARTED = 'Not Started',
  DEFERRED = 'Deferred',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  WAITING_FOR_INPUT = 'Waiting For Input',
}

@Entity({ name: 'task' })
export class Task extends BaseEntity {
  @ManyToOne(() => User, (u) => u.tasks)
  @JoinColumn()
  owner: User

  @Column({ type: 'uuid' })
  ownerId: string

  @ManyToOne(() => Lead, (lead) => lead.tasks)
  @JoinColumn()
  lead: Lead

  @ManyToOne(() => Contact, (contact) => contact.tasks)
  @JoinColumn()
  contact: Contact

  @Column({ type: 'uuid', nullable: true, default: null })
  contactId: string | null

  @Column({ type: 'uuid', nullable: true, default: null })
  leadId: string | null

  @ManyToOne(() => Account, (account) => account.tasks)
  @JoinColumn()
  account: Account

  @Column({ type: 'uuid', nullable: true, default: null })
  accountId: string

  @ManyToOne(() => Deal, (deal) => deal.tasks)
  @JoinColumn()
  deal: Deal

  @Column({ type: 'uuid', nullable: true, default: null })
  dealId: string

  @Column({ enum: TaskPriority, type: 'enum', default: TaskPriority.HIGH })
  priority: TaskPriority

  @Column({ enum: TaskStatus, type: 'enum', default: TaskStatus.NOT_STARTED })
  status: TaskStatus

  @Column({ type: 'varchar' })
  subject: string

  @Column({ type: 'date', nullable: true, default: null })
  dueDate: Date | null

  @Column({ type: 'varchar', nullable: true, default: null })
  description: string | null
}
