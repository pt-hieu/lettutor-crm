import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import Dropdown from '@utils/components/Dropdown'
import Paginate from '@utils/components/Paginate'
import { mapLog } from '@utils/libs/mapLog'
import { LogAction, LogSource } from '@utils/models/log'
import { getRawDealStage } from '@utils/service/deal'
import { getLogs } from '@utils/service/log'

import LogFilter from './LogFilter'
import LogItem from './LogItem'

type TProps = {
  title: string
  entityId: string
  source: LogSource
}

export default function LogSection({ title, entityId, source }: TProps) {
  const [page, setPage] = useState(1)

  const [action, setAction] = useState<LogAction>()
  const [from, setFrom] = useState<string>()
  const [to, setTo] = useState<string>()
  const [owner, setOwner] = useState<string>()

  const { data: logs, refetch } = useQuery(
    [entityId, 'detail-log'],
    getLogs({
      entity: entityId,
      page,
      limit: 5,
      action,
      source,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      owner,
    }),
    { enabled: false },
  )

  const { data: stages } = useQuery('deal-stage-raw', getRawDealStage)

  const mapLogs = mapLog(logs?.items || [], stages || [])

  useEffect(() => {
    refetch()
  }, [page, action, source, from, to, owner, entityId])

  return (
    <div className="p-4 border rounded-md">
      <div className="mb-4 flex justify-between">
        <div className="font-semibold text-[17px]" id={title}>
          {title}
        </div>

        <div className="flex gap-4 items-center">
          <Paginate
            currentPage={page}
            totalPage={logs?.meta.totalPages}
            pageSize={5}
            onPageChange={setPage}
          />

          <Dropdown
            triggerOnHover={false}
            overlay={
              <LogFilter
                containerClassName="bg-white border rounded-md p-4 min-w-[300px] translate-y-[10px] shadow-md"
                stopPropagateOnClick
                defaultValues={{ action, source, from, to, owner }}
                onActionChange={setAction}
                onFromChange={setFrom}
                onOwnerChange={setOwner}
                onToChange={setTo}
              />
            }
          >
            <button className="fa fa-filter crm-button-secondary" />
          </Dropdown>
        </div>
      </div>

      <div className="flex flex-col gap-6 divide-y pb-4">
        {!logs?.items.length && (
          <div className="text-gray-500 font-medium">No logs found.</div>
        )}

        {mapLogs.map((log, index) => (
          <LogItem
            className="ring-0 px-0 pb-0"
            key={log.id}
            data={log}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
