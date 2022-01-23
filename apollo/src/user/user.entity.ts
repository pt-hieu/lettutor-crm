import { Exclude } from 'class-transformer'
import { Account } from 'src/account/account.entity'
import { Contact } from 'src/contact/contact.entity'
import { Deal } from 'src/deal/deal.entity'
import { Lead } from 'src/lead/lead.entity'
import { Task } from 'src/task/task.entity'
import { Actions } from 'src/type/action'
import { BaseEntity } from 'src/utils/base.entity'
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm'

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

  @OneToMany(() => Lead, (lead) => lead.owner)
  @Exclude({ toPlainOnly: true })
  leads: Lead[]

  @OneToMany(() => Contact, (contact) => contact.owner)
  @Exclude({ toPlainOnly: true })
  contacts: Contact[]

  @OneToMany(() => Deal, (deal) => deal.owner)
  @Exclude({ toPlainOnly: true })
  deals: Deal[]

  @OneToMany(() => Account, (account) => account.owner)
  @Exclude({ toPlainOnly: true })
  accounts: Account[]

  @OneToMany(() => Task, (task) => task.owner)
  @Exclude({ toPlainOnly: true })
  tasks: Task[]

  @ManyToMany(() => Role, (r) => r.users, { eager: true })
  @JoinTable()
  roles: Role[]
}

@Entity()
export class Role extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  name: string

  @Column({ type: 'varchar', array: true, default: [] })
  actions: Actions[]

  @ManyToOne(() => Role, (r) => r.children)
  parent: Role

  @Column({ type: 'uuid', array: true, default: null, select: false })
  @Exclude({ toPlainOnly: true })
  childrenIds: string[]

  @OneToMany(() => Role, (r) => r.parent)
  @JoinColumn()
  children: Role[]

  @ManyToMany(() => User, (u) => u.roles)
  users: User[]
}
