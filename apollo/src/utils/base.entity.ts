import { Exclude } from 'class-transformer'
import { User } from 'src/user/user.entity'
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  DeleteDateColumn,
} from 'typeorm'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  createdById: string | null

  createdBy: User | null

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  updatedById: string | null

  updatedBy: User | null

  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude({ toPlainOnly: true })
  deletedAt: Date
}
