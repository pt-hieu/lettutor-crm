import { forwardRef, useImperativeHandle } from 'react'

import { useStore } from '@utils/hooks/useStore'
import { DealStageType } from '@utils/models/deal'

type Props = {
  relateTo: string
  targetId: string
}

type Ref = {
  type: DealStageType | undefined
}

export default forwardRef<Ref, Props>(function RelationCell(
  { relateTo, targetId },
  ref,
) {
  const { data: relationItems } = useStore<
    { name: string; id: string; type?: DealStageType }[]
  >(['relation-data', relateTo])

  useImperativeHandle(ref, () => ({
    type: relationItems?.find((item) => item.id === targetId)?.type,
  }))

  return <>{relationItems?.find((item) => item.id === targetId)?.name}</>
})
