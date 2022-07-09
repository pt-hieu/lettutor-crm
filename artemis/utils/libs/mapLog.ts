import { DealStageData } from '@components/DealStage/DealStageTable'

import { Log } from '@utils/models/log'

export const mapLog = (
  logs: Log[],
  stages: Pick<DealStageData, 'id' | 'name'>[],
) => {
  return logs.map((log) => {
    const changes = log.changes || []
    const index = changes.findIndex((item) => item.name === 'stageId')
    if (index > -1) {
      const stageFrom = stages.find((item) => item.id === changes[index].from)
      const stageTo = stages.find((item) => item.id === changes[index].to)
      changes[index] = {
        ...changes[index],
        fromName: stageFrom?.name,
        toName: stageTo?.name,
      }
    }
    return log
  })
}
