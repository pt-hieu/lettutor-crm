import { Exclude } from 'class-transformer'
import { Actions } from 'src/type/action'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm'

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
