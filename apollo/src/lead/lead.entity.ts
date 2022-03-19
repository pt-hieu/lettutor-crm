import { Exclude } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { Account } from 'src/account/account.entity'
import { Deal } from 'src/deal/deal.entity'
import { File } from 'src/file/file.entity'
import { Note } from 'src/note/note.entity'
import { Task } from 'src/task/task.entity'
import { Ownerful } from 'src/utils/owner.entity'

export enum LeadStatus {
  NONE = 'None',
  ATTEMPTED_TO_CONTACT = 'Attempted To Contact',
  CONTACT_IN_FUTURE = 'Contact In Future',
  CONTACTED = 'Contacted',
  JUNK_LEAD = 'Junk Lead',
  LOST_LEAD = 'Lost Lead',
  NOT_CONTACTED = 'Not Contacted',
  PRE_QUALIFIED = 'Pre Qualified',
  NOT_QUALIFIED = 'Not Qualified',
}

export enum LeadSource {
  NONE = 'None',
  FACEBOOK = 'Facebook',
  LET_TUTOR = 'Let Tutor',
  GOOGLE = 'Google',
}

@Entity({ name: 'lead' })
export class Lead extends Ownerful {
  @Column({ type: 'uuid', select: false, nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  accountId: string | null

  @ManyToOne(() => Account, (account) => account.contacts)
  @JoinColumn()
  account: Account

  @OneToMany(() => Deal, (deal) => deal.contact)
  deals: Deal[]

  @Column({ type: 'varchar' })
  fullName: string

  @Column({ type: 'varchar' })
  email: string

  @Column({ enum: LeadStatus, type: 'enum', default: LeadStatus.NONE })
  status: LeadStatus

  @Column({ enum: LeadSource, type: 'enum', default: LeadSource.NONE })
  source: LeadSource

  @Column({ type: 'varchar', nullable: true, default: null })
  address: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  description: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  phoneNum: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  socialAccount: string | null

  @OneToMany(() => Task, (task) => task.lead, { cascade: true })
  tasks: Task[]

  @OneToMany(() => Note, (note) => note.lead, { cascade: true })
  notes: Note[]

  @OneToMany(() => File, (f) => f.lead, { cascade: true, eager: true })
  attachments: File
}
