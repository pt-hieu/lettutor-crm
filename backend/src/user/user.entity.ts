import { BaseEntity } from '@/utils/base.entity'
import { Column, Entity } from 'typeorm'

export enum Role {
  SUPER_ADMIN = 'super admin',
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

  @Column({ enum: Role, type: 'enum', array: true })
  role: Role[]
}
