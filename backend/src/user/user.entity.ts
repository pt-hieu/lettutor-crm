import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity } from 'typeorm'

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
}
export enum Type {
  ACTIVE = 1,
  INACTIVE = 2,
  UNCONFIRMED = 3,
  DELETED = 4
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

  @Column({ enum: Role, type: 'text', array: true })
  role: Role[]

  @Column({ type: 'integer', default: 2 })
  type: Type
}
