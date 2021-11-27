import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity } from 'typeorm'

export enum Role {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
}

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
  password: string

  @Column({ type: 'varchar', nullable: true, default: null, unique: true })
  passwordToken: string | null

  @Column({ nullable: true, default: null })
  tokenExpiration: Date | null

  @Column({ enum: Role, type: 'enum', array: true })
  role: Role[]

  @Column({ enum: UserStatus, type: 'enum', default: UserStatus.ACTIVE })
  status: UserStatus
}
