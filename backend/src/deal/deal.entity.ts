import { Account } from 'src/account/account.entity'
import { LeadContact, LeadSource } from 'src/lead-contact/lead-contact.entity'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

export enum DealStage {
  AUTHENTICATION = 'Authentication',
  NEED_ANALYSIS = 'Need Analysis',
  VALUE_PROPOSITION = 'Value Proposition',
  SUBMIT_ESTIMATE_PRICE = 'Submit Estimate / Price',
  NEGOTIATE_REVIEW = 'Negotiate / Review',
  ENDED_SUCCESSFULLY = 'Ended Successfully',
  SKIP_THE_ENDING = 'Skip The Ending',
  ENDED_LOST_COMPLETELY = 'Ended - Lost Completely',
}

@Entity({ name: 'deal' })
export class Deal extends BaseEntity {
  @ManyToOne(() => User, (u) => u.deals, { eager: true })
  @JoinColumn()
  owner: User

  @Column({ type: 'uuid' })
  ownerId: string

  @ManyToOne(() => Account, (account) => account.deals, { eager: true })
  account: Account

  @Column({ type: 'uuid' })
  accountId: string

  @ManyToOne(() => LeadContact, { eager: true })
  contact: LeadContact

  @Column({ type: 'uuid', nullable: true, default: null })
  contactId: string | null

  @Column({ type: 'varchar' })
  fullName: string

  @Column({ type: 'double precision', nullable: true, default: null })
  amount: number | null

  @Column({ type: 'date' })
  closingDate: Date

  @Column({ enum: DealStage, type: 'enum', default: DealStage.AUTHENTICATION })
  stage: DealStage

  @Column({ enum: LeadSource, type: 'enum', default: LeadSource.NONE })
  source: LeadSource

  @Column({ default: 10 })
  probability: number

  @Column({ type: 'varchar', nullable: true, default: null })
  description: string | null
}
