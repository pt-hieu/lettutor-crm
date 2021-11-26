import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity } from 'typeorm'

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN'
}
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNCONFIRMED = 'UNCONFIRMED',
  DELETED = 'DELETED'
}

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ type: 'varchar' })
  password: string

  @Column({ type: 'varchar', nullable: true, default: null, unique: true })
  resetPasswordToken: string | null

  @Column({ nullable: true, default: null })
  tokenExpiration: Date | null

  @Column({enum: Role, type: 'enum',  array: true})
  role: Role[]

  @Column({ enum: UserStatus, type: 'enum', default: UserStatus.INACTIVE })
  status: UserStatus
}
