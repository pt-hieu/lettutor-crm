import { Account } from 'src/account/account.entity'
import { Note } from 'src/note/note.entity'
import { Contact } from 'src/contact/contact.entity'
import { LeadSource } from 'src/lead/lead.entity'
import { Task } from 'src/task/task.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { Ownerful } from 'src/utils/owner.entity'
import { Exclude } from 'class-transformer'

export enum DealStage {
  QUALIFICATION = 'Qualification',
  NEEDS_ANALYSIS = 'Needs Analysis',
  VALUE_PROPOSITION = 'Value Proposition',
  IDENTIFY_DECISION_MAKERS = 'Identify Decision Makers',
  PROPOSAL_PRICE_QUOTE = 'Proposal/Price Quote',
  NEGOTIATION_REVIEW = 'Negotiation/Review',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost',
  CLOSED_LOST_TO_COMPETITION = 'Closed-Lost To Competition',
}

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

  @Column({ enum: DealStage, type: 'enum', default: DealStage.QUALIFICATION })
  stage: DealStage

  @Column({ enum: LeadSource, type: 'enum', default: LeadSource.NONE })
  source: LeadSource

  @Column({ type: 'double precision', nullable: true, default: null })
  probability: number | null

  @Column({ type: 'varchar', nullable: true, default: 10 })
  description: string | null

  @OneToMany(() => Task, (task) => task.deal)
  tasks: Task[]

  @OneToMany(() => Note, (note) => note.deal)
  notes: Note[]
}
