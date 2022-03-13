import { Exclude } from 'class-transformer'
import { Column, Entity, OneToMany } from 'typeorm'

import { Deal } from 'src/deal/deal.entity'
import { BaseEntity } from 'src/utils/base.entity'

export enum DealStageCategory {
  OPEN = 'Open',
  CLOSE_WON = 'Close Won',
  CLOSE_LOST = 'Close Lost',
}

@Entity({ name: 'deal_stage' })
export class DealStage extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string

  @Column({
    enum: DealStageCategory,
    type: 'enum',
    default: DealStageCategory.OPEN,
  })
  category: DealStageCategory

  @Column({ type: 'double precision', nullable: true })
  probability: number

  @OneToMany(() => Deal, (deal) => deal.stage, { cascade: true })
  @Exclude({ toPlainOnly: true })
  deals: Deal[]

  @Column()
  // @Exclude({ toPlainOnly: true })
  order: number
}
