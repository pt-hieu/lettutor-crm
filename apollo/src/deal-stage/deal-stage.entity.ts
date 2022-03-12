import { Exclude } from 'class-transformer'
import { Column, Entity, OneToMany } from 'typeorm'

import { Deal } from 'src/deal/deal.entity'
import { BaseEntity } from 'src/utils/base.entity'

export enum StageCategory {
  OPEN = 'Open',
  CLOSE_WON = 'Close Won',
  CLOSE_LOST = 'Close Lost',
}

@Entity({ name: 'deal-stage' })
export class DealStage extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string

  @Column({ enum: StageCategory, type: 'enum', default: StageCategory.OPEN })
  category: StageCategory

  @Column({ type: 'double precision', nullable: true })
  probability: number

  @OneToMany(() => Deal, (deal) => deal.stage, { cascade: true })
  @Exclude({ toPlainOnly: true })
  deals: Deal[]
}
