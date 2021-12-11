import { Exclude } from 'class-transformer'
import { Account } from 'src/account/account.entity'
import { Deal } from 'src/deal/deal.entity'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

export enum LeadStatus {
  NONE = 'None',
  TRIED_CONTACTING = 'Tried Contacting',
  CONTACT_IN_THE_FUTURE = 'Contact In The Future',
  CONTACTED = 'Contacted',
  NOT_CONTACTED_YET = 'Not Contacted Yet',
  OFFER_SOMETHING = 'Offer Something',
  OFFER_LOST = 'Offer Lost',
  DEFINE_PRECONDITION = 'Define Precondition',
  NOT_ELIGIBLE = 'Not Eligible',
}

export enum LeadSource {
  NONE = 'None',
  FACEBOOK = 'Facebook',
  LET_TUTOR = 'Let Tutor',
  GOOGLE = 'Google',
}

@Entity({ name: 'lead_contact' })
export class LeadContact extends BaseEntity {
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  owner: User

  @Column({ type: 'uuid', select: false })
  ownerId: string

  @ManyToOne(() => Account, { eager: true })
  @JoinColumn()
  account: Account

  @Column({ type: 'uuid', select: false, nullable: true, default: null })
  accountId: string | null

  @Column({ default: true })
  isLead: boolean

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
}
