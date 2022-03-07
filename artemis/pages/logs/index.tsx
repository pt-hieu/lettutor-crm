import LogItem from '@components/Logs/LogItem'
import Layout from '@utils/components/Layout'
import Paginate from '@utils/components/Paginate'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getSessionToken } from '@utils/libs/getToken'
import { LogAction, LogSource } from '@utils/models/log'
import { getLogs } from '@utils/service/log'
import { GetServerSideProps } from 'next'
import { dehydrate, QueryClient, useQuery } from 'react-query'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query: q,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  const page = Number(q.page) || 1
  const limit = Number(q.limit) || 10

  const property = q.property as string | undefined
  const source = q.source as LogSource | undefined
  const action = q.action as LogAction | undefined

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['logs', page, limit, source || '', action || '', property || ''],
        getLogs({ page, limit, property }, token),
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

  const [property, setProperty] = useQueryState<string>('property')

  const { data: logs } = useQuery(
    [
      'logs',
      page || 1,
      limit || 10,
      source || '',
      action || '',
      property || '',
    ],
    getLogs({ page, limit, source, action, property }),
  )

  return (
    <Layout title="CRM | Log" requireLogin>
      <div className="grid grid-cols-[3fr,7fr] gap-4 crm-container">
        <div>
          {/* @ts-ignore */}
          <Paginate
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
            <LogItem key={log.id} data={log} index={index} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
