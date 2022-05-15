import { Exclude } from 'class-transformer'
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'

import { Role } from 'src/role/role.entity'
import { Task } from 'src/task/task.entity'
import { BaseEntity } from 'src/utils/base.entity'

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

  @OneToMany(() => Task, (task) => task.owner, { cascade: true })
  @Exclude({ toPlainOnly: true })
  tasks: Task[]

  @ManyToMany(() => Role, (r) => r.users, { eager: true })
  @JoinTable()
  roles: Role[]
}
