import { Contact } from 'src/contact/contact.entity'
import { Deal } from 'src/deal/deal.entity'
import { Task } from 'src/task/task.entity'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

export enum AccountType {
  NONE = 'None',
  ANALYST = 'Analyst',
  COMPETITOR = 'Competitor',
  CUSTOMER = 'Customer',
  DISTRIBUTOR = 'Distributor',
  INTEGRATOR = 'Integrator',
  INVESTOR = 'Investor',
  OTHER = 'Other',
  PARTNER = 'Partner',
  PRESS = 'Press',
  PROSPECT = 'Prospect',
  RESELLER = 'Reseller',
  VENDOR = 'Vendor',
}

@Entity({ name: 'account' })
export class Account extends BaseEntity {
  @ManyToOne(() => User, (u) => u.accounts)
  @JoinColumn()
  owner: User | null

  @Column({ type: 'uuid', nullable: true })
  ownerId: string | null

  @Column({ type: 'varchar' })
  fullName: string

  @Column({ enum: AccountType, type: 'enum', default: AccountType.NONE })
  type: AccountType

  @Column({ type: 'varchar', nullable: true, default: null })
  address: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  description: string | null

  @Column({ type: 'varchar', nullable: true, default: null })
  phoneNum: string | null

  @OneToMany(() => Contact, (contact) => contact.account)
  contacts: Contact[]

  @OneToMany(() => Deal, (deal) => deal.account)
  deals: Deal[]

  @OneToMany(() => Task, (task) => task.account)
  tasks: Task[]
}
