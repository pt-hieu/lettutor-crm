import { Deal } from 'src/deal/deal.entity'
import { User } from 'src/user/user.entity'
import { BaseEntity } from 'src/utils/base.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'


@Entity({ name: 'note' })
export class Note extends BaseEntity {
  @ManyToOne(() => User, (u) => u.deals)
  @JoinColumn()
  owner: User | null

  @Column({ type: 'uuid', nullable: true })
  ownerId: string | null

  @ManyToOne(() => Deal, (deal) => deal.notes)
  @JoinColumn()
  deal: Deal

  @Column({ type: 'uuid', nullable: true, default: null })
  dealId: string | null

  @Column({ type: 'varchar' })
  title: string

  @Column({ type: 'varchar' })
  content: string
}
