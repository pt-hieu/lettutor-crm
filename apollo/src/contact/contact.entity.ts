import { Exclude } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { Account } from 'src/account/account.entity'
import { Deal } from 'src/deal/deal.entity'
import { LeadSource, LeadStatus } from 'src/lead/lead.entity'
import { Note } from 'src/note/note.entity'
import { Task } from 'src/task/task.entity'
import { Ownerful } from 'src/utils/owner.entity'

@Entity({ name: 'contact' })
export class Contact extends Ownerful {
  @Column({ type: 'uuid', select: true, nullable: true, default: null })
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

  @OneToMany(() => Task, (task) => task.contact, { cascade: true })
  tasks: Task[]

  @OneToMany(() => Note, (note) => note.contact, { cascade: true })
  notes: Note[]
}
