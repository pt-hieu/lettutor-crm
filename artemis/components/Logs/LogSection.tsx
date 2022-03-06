import { getLogs } from '@utils/service/log'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import LogItem from './LogItem'

type TProps = {
  title: string
  entityId: string
}

export default function LogSection({ title, entityId }: TProps) {
  const { data: logs, refetch } = useQuery(
    [entityId, 'detail-log'],
    getLogs({ entity: entityId }),
    { enabled: false },
  )

  useEffect(() => {
    refetch()
  }, [])

  return (
    <div className="pt-4">
      <div className="font-semibold mb-4 text-[17px]" id={title}>
        {title}
      </div>

      <div className="flex flex-col gap-4">
        {logs?.items.map((log, index) => (
          <LogItem key={log.id} data={log} index={index} />
        ))}
      </div>
    </div>
  )
}
