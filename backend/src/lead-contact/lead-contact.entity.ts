import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

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
  @ManyToOne(() => User, (user) => user.leadContacts, {
    eager: false,
  })
  @JoinColumn()
  owner: User

  @Column({ type: 'uuid', select: false })
  ownerId: string

  @Column({ type: 'varchar' })
  fullName: string

  @Column({ type: 'varchar', unique: true })
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
