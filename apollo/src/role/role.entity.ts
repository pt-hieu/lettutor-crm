import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm'

import { Actions } from 'src/type/action'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'

@Entity()
export class Role extends BaseEntity {
  @Column({ unique: true, type: 'varchar' })
  name: string

  @Column({ default: false })
  default: boolean

  @Column({ type: 'varchar', array: true, default: [] })
  actions: Actions[]

  @ManyToOne(() => Role, (r) => r.children)
  parent: Role

  @OneToMany(() => Role, (r) => r.parent)
  @JoinColumn()
  children: Role[]

  @ManyToMany(() => User, (u) => u.roles)
  users: User[]
}
