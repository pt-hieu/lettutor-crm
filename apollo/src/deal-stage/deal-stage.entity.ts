import { Column, Entity, OneToMany } from 'typeorm'

import { BaseEntity } from 'src/utils/base.entity'

export enum DealStageType {
  OPEN = 'Open',
  CLOSE_WON = 'Close Won',
  CLOSE_LOST = 'Close Lost',
}

@Entity({ name: 'deal_stage' })
export class DealStage extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string

  @Column({
    enum: DealStageType,
    type: 'enum',
    default: DealStageType.OPEN,
  })
  type: DealStageType

  @Column({ type: 'double precision', nullable: true })
  probability: number

  @Column()
  order: number
}
