import { Exclude } from 'class-transformer'
import { Account } from 'src/account/account.entity'
import { Deal } from 'src/deal/deal.entity'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

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

@Entity({ name: 'lead_contact' })
export class LeadContact extends BaseEntity {
  @ManyToOne(() => User, (user) => user.leadContacts)
  @JoinColumn()
  owner: User | null

  @Column({ type: 'uuid', nullable: true, select: false })
  ownerId: string | null

  @Column({ type: 'uuid', select: false, nullable: true, default: null })
  accountId: string | null

  @ManyToOne(() => Account, (account) => account.contacts)
  @JoinColumn()
  account: Account

  @OneToMany(() => Deal, (deal) => deal.contact)
  deals: Deal[]

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
