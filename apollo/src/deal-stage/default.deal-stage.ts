import { DealStage, DealStageType } from './deal-stage.entity'

export const defaultDealStages: Pick<
  DealStage,
  'name' | 'type' | 'probability' | 'order'
>[] = [
  {
    name: 'Deal stage 1',
    type: DealStageType.OPEN,
    probability: 40,
    order: 1,
  },
  {
    name: 'Deal stage 2',
    type: DealStageType.CLOSE_WON,
    probability: 100,
    order: 2,
  },
  {
    name: 'Deal stage 3',
    type: DealStageType.CLOSE_LOST,
    probability: 0,
    order: 3,
  },
]
