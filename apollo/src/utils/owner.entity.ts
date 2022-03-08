import { Exclude } from 'class-transformer'
import { Column, JoinColumn, ManyToOne } from 'typeorm'

import { User } from 'src/user/user.entity'

import { BaseEntity } from './base.entity'

export class Ownerful extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  ownerId: string | null
}
