import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm'

import { Action } from 'src/action/action.entity'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'

@Entity()
export class Role extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  name: string

  @Column({ default: false })
  default: boolean

  @ManyToOne(() => Role, (r) => r.children)
  parent: Role

  @OneToMany(() => Role, (r) => r.parent)
  @JoinColumn()
  children: Role[]

  @ManyToMany(() => User, (u) => u.roles)
  users: User[]

  @ManyToMany(() => Action, (a) => a.roles, { eager: true })
  @JoinTable()
  actions: Action[]
}
