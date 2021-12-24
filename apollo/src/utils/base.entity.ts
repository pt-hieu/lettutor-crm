import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt?: Date

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt?: Date

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string | null
}
