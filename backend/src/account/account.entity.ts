import { Deal } from 'src/deal/deal.entity'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

@Entity({ name: 'account' })
export class Account extends BaseEntity {
  @ManyToOne(() => User, (u) => u.accounts)
  @JoinColumn()
  owner: User

  @Column({ type: 'uuid' })
  ownerId: string

  @Column({ type: 'varchar' })
  fullName: string

  @Column({ type: 'varchar', nullable: true, default: null })
  address: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  description: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  phoneNum: string | null

  @OneToMany(() => LeadContact, (leadContact) => leadContact.account)
  contacts: LeadContact[]

  @OneToMany(() => Deal, (deal) => deal.account)
  deals: Deal[]
}
