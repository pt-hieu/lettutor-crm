import { Exclude } from 'class-transformer'
import { Account } from 'src/account/account.entity'
import { Contact } from 'src/contact/contact.entity'
import { Deal } from 'src/deal/deal.entity'
import { Lead } from 'src/lead/lead.entity'
import { Role } from 'src/role/role.entity'
import { Task } from 'src/task/task.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  UNCONFIRMED = 'Unconfirmed',
  DELETED = 'Deleted',
}

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ type: 'varchar', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  password: string | null

  @Column({ type: 'varchar', nullable: true, default: null, unique: true })
  @Exclude({ toPlainOnly: true })
  passwordToken: string | null

  @Column({ nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  tokenExpiration: Date | null

  @Column({ enum: UserStatus, type: 'enum', default: UserStatus.ACTIVE })
  status: UserStatus

  @OneToMany(() => Lead, (lead) => lead.owner, { cascade: true })
  @Exclude({ toPlainOnly: true })
  leads: Lead[]

  @OneToMany(() => Contact, (contact) => contact.owner, { cascade: true })
  @Exclude({ toPlainOnly: true })
  contacts: Contact[]

  @OneToMany(() => Deal, (deal) => deal.owner, { cascade: true })
  @Exclude({ toPlainOnly: true })
  deals: Deal[]

  @OneToMany(() => Account, (account) => account.owner, { cascade: true })
  @Exclude({ toPlainOnly: true })
  accounts: Account[]

  @OneToMany(() => Task, (task) => task.owner, { cascade: true })
  @Exclude({ toPlainOnly: true })
  tasks: Task[]

  @ManyToMany(() => Role, (r) => r.users, { eager: true })
  @JoinTable()
  roles: Role[]
}
