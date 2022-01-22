import { Exclude } from 'class-transformer'
import { Deal } from 'src/deal/deal.entity'
import { Ownerful } from 'src/utils/owner.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity({ name: 'note' })
export class Note extends Ownerful {
  @ManyToOne(() => Deal, (deal) => deal.notes)
  @JoinColumn()
  deal: Deal

  @Column({ type: 'uuid', nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  dealId: string | null

  @Column({ type: 'varchar' })
  title: string

  @Column({ type: 'varchar' })
  content: string
}
