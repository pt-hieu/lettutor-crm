import { Exclude } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { Account } from 'src/account/account.entity'
import { Contact } from 'src/contact/contact.entity'
import { DealStage } from 'src/deal-stage/deal-stage.entity'
import { LeadSource } from 'src/lead/lead.entity'
import { Note } from 'src/note/note.entity'
import { Task } from 'src/task/task.entity'
import { Ownerful } from 'src/utils/owner.entity'

@Entity({ name: 'deal' })
export class Deal extends Ownerful {
  @ManyToOne(() => Account, (account) => account.deals)
  @JoinColumn()
  account: Account

  @Column({ type: 'uuid' })
  @Exclude({ toPlainOnly: true })
  accountId: string

  @ManyToOne(() => Contact)
  @JoinColumn()
  contact: Contact

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  contactId: string | null

  @Column({ type: 'varchar' })
  fullName: string

  @Column({ type: 'date' })
  closingDate: Date

  @Column({ type: 'double precision', nullable: true, default: null })
  amount: number | null

  @ManyToOne(() => DealStage, (stage) => stage.deals)
  @JoinColumn()
  stage: DealStage

  @Column({ type: 'uuid' })
  @Exclude({ toPlainOnly: true })
  stageId: string

  @Column({ enum: LeadSource, type: 'enum', default: LeadSource.NONE })
  source: LeadSource

  @Column({ type: 'double precision', nullable: true, default: null })
  probability: number | null

  @Column({ type: 'varchar', nullable: true, default: 10 })
  description: string | null

  @OneToMany(() => Task, (task) => task.deal, { cascade: true })
  tasks: Task[]

  @OneToMany(() => Note, (note) => note.deal, { cascade: true })
  notes: Note[]
}
