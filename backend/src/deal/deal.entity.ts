import { LeadSource } from 'src/lead-contact/lead-contact.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity } from 'typeorm'

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
  @Column({ type: 'uuid' })
  ownerId: string

  @Column({ type: 'uuid' })
  accountId: string

  @Column({ type: 'uuid', nullable: true, default: null })
  contactId?: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'double precision', nullable: true, default: null })
  amount: number | null

  @Column({ type: 'date' })
  closingDate: Date

  @Column({ enum: DealStage, type: 'enum', default: DealStage.AUTHENTICATION })
  stage: DealStage

  @Column({ enum: LeadSource, type: 'enum', default: LeadSource.NONE })
  source: LeadSource

  @Column({ default: 10 })
  probability: number | 10

  @Column({ type: 'varchar', nullable: true, default: null })
  description: string | null
}
