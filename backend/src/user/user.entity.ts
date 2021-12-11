import { Exclude } from 'class-transformer'
import { Account } from 'src/account/account.entity'
import { Deal } from 'src/deal/deal.entity'
import { LeadContact } from 'src/lead-contact/lead-contact.entity'
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

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', nullable: true, default: null })
  password: string | null

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', nullable: true, default: null, unique: true })
  passwordToken: string | null

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true, default: null })
  tokenExpiration: Date | null

  @Column({ enum: UserStatus, type: 'enum', default: UserStatus.ACTIVE })
  status: UserStatus

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
  childrenIds: string[]

  @OneToMany(() => Role, (r) => r.parent)
  @JoinColumn()
  children: Role[]

  @ManyToMany(() => User, (u) => u.roles)
  users: User[]
}
