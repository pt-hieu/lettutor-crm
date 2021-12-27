import { GlobalState } from '@utils/GlobalStateKey'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'

export type UseGlobalDateProps = {
  callback: () => void
  key?: string
}

export default function useGlobalDate({ callback, key }: UseGlobalDateProps) {
  const memoizedCb = useMemo(() => callback, [])
  const memoizedKey = useMemo(() => key, [])

  const client = useQueryClient()

  const [time, setTime] = useState(() => new Date())
  const { data: globalTime } = useQuery<Date>(memoizedKey || GlobalState.DATE, {
    enabled: false,
  })

  useEffect(() => {
    if (moment(time).isBefore(globalTime)) {
      memoizedCb()
    }
  }, [globalTime])

  const effect = useCallback(() => {
    const now = new Date()

    setTime(now)
    client.setQueryData(memoizedKey || GlobalState.DATE, now)
  }, [])

  return {
    effect,
  }
}
