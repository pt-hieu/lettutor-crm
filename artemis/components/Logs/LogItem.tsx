import { formatDate } from '@utils/libs/time'
import { Log, LogAction } from '@utils/models/log'
import Link from 'next/link'
import { memo, ReactNode, useCallback, useMemo } from 'react'

type TProps = {
  data: Log
  index: number
}

const ActionMapping: Record<LogAction, string> = {
  [LogAction.CREATE]: 'created',
  [LogAction.UPDATE]: 'updated',
  [LogAction.DELETE]: 'deleted',
}

export default memo(function LogItem({ data, index }: TProps) {
  const {
    owner,
    action,
    source,
    entityName,
    createdAt,
    changes,
    id,
    entityId,
    deleted,
  } = data

  const formatName = useCallback((name: string) => {
    if (name.endsWith('Id')) name = name.replace('Id', '')

    const result = name.replace(/([A-Z])/g, ' $1')
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1)

    return finalResult
  }, [])

  const renderLogContent = useMemo<Record<LogAction, ReactNode>>(
    () => ({
      [LogAction.CREATE]: <>{entityName}</>,
      [LogAction.UPDATE]: (
        <>
          <div>
            {changes?.map((change) => (
              <div key={change.name + id + index + 'summary'}>
                {change.toName || change.to}
              </div>
            ))}
          </div>

          <div className="mt-2">
            {changes?.map((change) => (
              <div key={change.name + change.to + id + index}>
                <span className="font-semibold">{formatName(change.name)}</span>{' '}
                <span className="text-gray-500">
                  changed from '{change.fromName || change.from || 'Empty'}' to{' '}
                </span>{' '}
                <span className="font-semibold">
                  {change.toName || change.to}
                </span>
              </div>
            ))}
          </div>
        </>
      ),
      [LogAction.DELETE]: <>{entityName}</>,
    }),
    [data],
  )

  return (
    <div className="p-3 ring-gray-200 ring-1 hover:ring-blue-600 rounded-md crm-transition">
      <div className="flex items-center gap-4">
        <span className="w-10 h-10 bg-gray-300 rounded-full" />

        <div>
          <div>
            <span className="font-semibold">{owner?.name || 'A user'}</span>{' '}
            {ActionMapping[action]} the{' '}
            <span className="capitalize">{source}</span>{' '}
            <Link href={`/${source + 's/' + entityId}`}>
              <a
                className={`${
                  deleted ? 'pointer-events-none text-current' : ''
                }`}
              >
                {entityName}
              </a>
            </Link>
          </div>

          <span className="text-[12px]">{formatDate(createdAt)}</span>
        </div>
      </div>

      <div className="pl-14 mt-4">{renderLogContent[action]}</div>
    </div>
  )
})
