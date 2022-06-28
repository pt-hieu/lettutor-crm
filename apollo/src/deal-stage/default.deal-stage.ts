import { DealStage, DealStageType } from './deal-stage.entity'

export const defaultDealStages: Pick<
  DealStage,
  'name' | 'type' | 'probability' | 'order'
>[] = [
  {
    name: 'Qualification',
    type: DealStageType.OPEN,
    probability: 10,
    order: 1,
  },
  {
    name: 'Need Analysis',
    type: DealStageType.OPEN,
    probability: 45,
    order: 2,
  },
  {
    name: 'Value Proposition',
    type: DealStageType.OPEN,
    probability: 40,
    order: 3,
  },
  {
    name: 'Identify Decision Makers',
    type: DealStageType.OPEN,
    probability: 60,
    order: 4,
  },
  {
    name: 'Proposal / Price Quote',
    type: DealStageType.OPEN,
    probability: 75,
    order: 5,
  },
  {
    name: 'Negotiation / Price Review',
    type: DealStageType.OPEN,
    probability: 90,
    order: 6,
  },
  {
    name: 'Closed Won',
    type: DealStageType.CLOSE_WON,
    probability: 100,
    order: 7,
  },
  {
    name: 'Closed Lost',
    type: DealStageType.CLOSE_LOST,
    probability: 0,
    order: 8,
  },
  {
    name: 'Closed Lost to Competition',
    type: DealStageType.CLOSE_LOST,
    probability: 0,
    order: 9,
  },
]
