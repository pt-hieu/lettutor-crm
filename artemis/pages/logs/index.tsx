import { Divider } from 'antd'
import { GetServerSideProps } from 'next'
import { QueryClient, dehydrate, useQuery } from 'react-query'

import LogFilter from '@components/Logs/LogFilter'
import LogItem from '@components/Logs/LogItem'

import Layout from '@utils/components/Layout'
import Paginate from '@utils/components/Paginate'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getSessionToken } from '@utils/libs/getToken'
import { LogAction, LogSource } from '@utils/models/log'
import { getLogs } from '@utils/service/log'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query: q,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  const page = Number(q.page) || 1
  const limit = Number(q.limit) || 10

  const source = q.source as LogSource | undefined
  const action = q.action as LogAction | undefined

  const property = q.property as string | undefined
  const entity = q.entity as string | undefined

  const from = q.from as string | undefined
  const to = q.to as string | undefined

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        [
          'logs',
          page,
          limit,
          source || '',
          action || '',
          property || '',
          from || '',
          to || '',
          entity || '',
        ],
        getLogs(
          {
            page,
            limit,
            action,
            source,
            property,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            entity: entity,
          },
          token,
        ),
      ),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default function LogPage() {
  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')

  const [source, setSource] = useQueryState<LogSource>('source')
  const [action, setAction] = useQueryState<LogAction>('action')

  const [from, setFrom] = useQueryState<string>('from')
  const [to, setTo] = useQueryState<string>('to')

  const [owner, setOwner] = useQueryState<string>('owner')

  const [property, setProperty] = useQueryState<string>('property')
  const [entity, setEntity] = useQueryState<string>('entity')

  const { data: logs } = useQuery(
    [
      'logs',
      page || 1,
      limit || 10,
      source || '',
      action || '',
      property || '',
      from || '',
      to || '',
      entity || '',
    ],
    getLogs({
      page,
      limit,
      source,
      action,
      property,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      entity: entity,
    }),
  )

  const [start, end, total] = usePaginateItem(logs)

  return (
    <Layout title="CRM | Log" requireLogin>
      <div className="grid grid-cols-[3fr,7fr] gap-8 crm-container">
        <div className="flex flex-col top-[76px] sticky h-fit">
          <LogFilter
            defaultValues={{
              action,
              from,
              owner,
              source,
              to,
            }}
            onActionChange={setAction}
            onFromChange={setFrom}
            onOwnerChange={setOwner}
            onSourceChange={setSource}
            onToChange={setTo}
          />

          <Divider />

          <div className="mb-2 text-right">
            Showing from {start} to {end} of {total}
          </div>

          <Paginate
            containerClassName="self-end"
            currentPage={Number(page || 1)}
            showQuickJump
            showJumpToHead
            pageSize={limit || 10}
            totalPage={logs?.meta.totalPages}
            onPageChange={setPage}
          />
        </div>

        <div className="flex flex-col gap-4">
          {logs?.items.map((log, index) => (
            <LogItem
              onPropertySelected={setProperty}
              onEntitySelected={setEntity}
              key={log.id}
              data={log}
              index={index}
            />
          ))}
        </div>
      </div>
    </Layout>
  )
}
