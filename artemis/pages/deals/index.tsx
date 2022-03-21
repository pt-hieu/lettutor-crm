import { Table, TableColumnType } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useCallback } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { QueryClient, dehydrate, useQuery, useQueryClient } from 'react-query'

import KanbanView from '@components/Deals/KanbanView'
import DealsSearch from '@components/Deals/Search'
import DealsSidebar from '@components/Deals/Sidebar'
import DealsViewLayout from '@components/Deals/ViewLayout'

import Animate from '@utils/components/Animate'
import Paginate from '@utils/components/Paginate'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getSessionToken } from '@utils/libs/getToken'
import { formatDate } from '@utils/libs/time'
import { Deal, DealStage, DealStageData } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'
import { getDealStages, getDeals } from '@utils/service/deal'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query: q,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  const page = Number(q.page) || 1
  const limit = Number(q.limit) || 10
  const search = q.search as string | undefined
  const source = q.source as LeadSource[] | undefined
  const stage = q.stage as DealStage[] | undefined

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['deals', page, limit, search || '', source || [], stage || []],
        getDeals({ limit, page, search, source, stage }, token),
      ),
      client.prefetchQuery(['deal-stages'], getDealStages(token)),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export const dealColumns: TableColumnType<Deal>[] = [
  {
    title: 'Deal Name',
    dataIndex: 'fullName',
    key: 'fullName',
    sorter: {
      compare: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    render: (_, { id, fullName }) => (
      <Link href={`/deals/${id}`}>
        <a className="crm-link underline hover:underline">{fullName}</a>
      </Link>
    ),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    sorter: {
      compare: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
  },
  {
    title: 'Stage',
    dataIndex: 'stage',
    key: 'stage',
    sorter: { compare: (a, b) => a.stage.name.localeCompare(b.stage.name) },
    render: ({ name }) => name,
  },
  {
    title: 'Closing Date',
    dataIndex: 'closingDate',
    key: 'closingDate',
    sorter: {
      compare: (a, b) =>
        new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime(),
    },
    render: (_, { closingDate }) => formatDate(closingDate),
  },
  {
    title: 'Contact Name',
    dataIndex: 'contact',
    key: 'contact',
    sorter: {
      compare: (a, b) => a.contact?.fullName.localeCompare(b.contact?.fullName),
    },
    render: (_, { contact }) => contact?.fullName,
  },
  {
    title: 'Account Name',
    dataIndex: 'account',
    key: 'account',
    sorter: {
      compare: (a, b) => a.account.fullName.localeCompare(b.account.fullName),
    },
    render: (_, { account }) => account.fullName,
  },
  {
    title: 'Deal Owner',
    dataIndex: 'owner',
    key: 'owner',
    sorter: {
      compare: (a, b) => a.owner?.name.localeCompare(b.owner?.name || '') || 1,
    },
    render: (_, { owner }) => owner?.name,
  },
]

export enum ViewMode {
  KANBAN = 'kanban',
  TABULAR = 'tabular',
}

export default function DealsView() {
  const client = useQueryClient()

  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')

  const [search, setSearch] = useQueryState<string>('search')
  const [source, setSource] = useQueryState<Array<LeadSource>>('source')
  const [stage, setStage] = useQueryState<Array<DealStage>>('stage')

  const key = [
    'deals',
    page || 1,
    limit || 10,
    search || '',
    source || [],
    stage || [],
  ]

  const { data: deals, isLoading } = useQuery(
    key,
    getDeals({ limit, page, search, source, stage }),
    {
      keepPreviousData: true,
    },
  )

  const { data: dealStages } = useQuery<DealStageData[]>(['deal-stages'], {
    enabled: false,
  })

  const applySearch = useCallback((keyword: string | undefined) => {
    unstable_batchedUpdates(() => {
      setPage(1)
      setSearch(keyword)
    })
  }, [])

  const [start, end, total] = usePaginateItem(deals)
  const [viewMode] = useQueryState<ViewMode>('view-mode', ViewMode.TABULAR)

  return (
    <DealsViewLayout
      title="CRM | Deals"
      sidebar={
        <DealsSidebar
          source={source}
          onSourceChange={setSource}
          stage={stage}
          onStageChange={setStage}
        />
      }
    >
      <DealsSearch search={search} onSearchChange={applySearch} />

      <div className="mt-4">
        <AnimatePresence presenceAffectsLayout>
          {search && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-2"
            >
              Showing from {start} to {end} of {total} results.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full">
          <Animate
            shouldAnimateOnExit
            on={viewMode}
            presenceProps={{
              exitBeforeEnter: true,
              presenceAffectsLayout: true,
            }}
            transition={{ duration: 0.2 }}
            animation={{
              start: { opacity: 0 },
              animate: { opacity: 1 },
              end: { opacity: 0 },
            }}
          >
            {viewMode === ViewMode.KANBAN && (
              <KanbanView
                queryKey={key}
                data={deals}
                dealStages={dealStages || []}
              />
            )}

            {(viewMode === ViewMode.TABULAR || viewMode === undefined) && (
              <div className="w-full flex flex-col gap-4">
                <Table
                  showSorterTooltip={false}
                  columns={dealColumns}
                  loading={isLoading}
                  dataSource={deals?.items}
                  rowKey={(u) => u.id}
                  rowSelection={{
                    type: 'checkbox',
                    onChange: (keys) =>
                      client.setQueryData(
                        'selected-dealIds',
                        keys.map((k) => k.toString()),
                      ),
                  }}
                  bordered
                  pagination={false}
                />

                <Paginate
                  containerClassName="self-end"
                  pageSize={limit || 10}
                  currentPage={page || 1}
                  totalPage={deals?.meta.totalPages}
                  onPageChange={setPage}
                  showJumpToHead
                  showQuickJump
                />
              </div>
            )}
          </Animate>
        </div>
      </div>
    </DealsViewLayout>
  )
}
