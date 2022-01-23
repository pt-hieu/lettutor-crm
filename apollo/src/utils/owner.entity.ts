import { Exclude } from 'class-transformer'
import { User } from 'src/user/user.entity'
import { Column, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'

export class Ownerful extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn()
  owner: User | null

  @Column({ type: 'uuid', nullable: true })
  @Exclude({ toPlainOnly: true })
  ownerId: string | null
}
