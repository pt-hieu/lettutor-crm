import DealsSearch from '@components/Deals/Search'
import DealsSidebar from '@components/Deals/Sidebar'
import DealsViewLayout from '@components/Deals/ViewLayout'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getSessionToken } from '@utils/libs/getToken'
import { Deal } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'
import { getDeals } from '@utils/service/deal'
import { Table, TableColumnType } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { dehydrate, QueryClient, useQuery } from 'react-query'

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

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['deals', page, limit, search || '', source || []],
        getDeals({ limit, page, search, source }, token),
      ),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

const columns: TableColumnType<Deal>[] = [
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
      compare: (a, b) => (a.amount ? (b.amount ? a.amount - b.amount : 1) : -1),
    },
  },
  {
    title: 'Stage',
    dataIndex: 'stage',
    key: 'stage',
    sorter: { compare: (a, b) => a.stage.localeCompare(b.stage) },
  },
  {
    title: 'Closing Date',
    dataIndex: 'closingDate',
    key: 'closingDate',
    sorter: {
      compare: (a, b) => a.closingDate.getTime() - b.closingDate.getTime(),
    },
  },
  {
    title: 'Contact Name',
    dataIndex: 'contact',
    key: 'contact',
    sorter: {
      compare: (a, b) => a.contact.fullName.localeCompare(b.contact.fullName),
    },
    // render: (_, { contact: { id, fullName } }) => (
    //   <Link href={`/contacts/${id}`}>
    //     <a className="crm-link underline hover:underline">{fullName}</a>
    //   </Link>
    // ),
    render: (_, { contact }) => contact.fullName,
  },
  {
    title: 'Account Name',
    dataIndex: 'account',
    key: 'account',
    sorter: {
      compare: (a, b) => a.account.fullName.localeCompare(b.account.fullName),
    },
    // render: (_, { account: { fullName, id } }) => (
    //   <Link href={`/accounts/${id}`}>
    //     <a className="crm-link underline hover:underline">{fullName}</a>
    //   </Link>
    // ),
    render: (_, { account }) => account.fullName,
  },
  {
    title: 'Deal Owner',
    dataIndex: 'owner',
    key: 'owner',
    sorter: {
      compare: (a, b) => a.owner.name.localeCompare(b.owner.name),
    },
    render: (_, { owner }) => owner.name,
  },
]

export default function DealsView() {
  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')

  const [search, setSearch] = useQueryState<string>('search')
  const [source, setSource] = useQueryState<Array<LeadSource>>('source', {
    isArray: true,
  })

  const { data: leads, isLoading } = useQuery(
    ['deals', page || 1, limit || 10, search || '', source || []],
    getDeals({ limit, page, search, source }),
  )

  const [start, end, total] = usePaginateItem(leads)

  return (
    <DealsViewLayout
      title="CRM | Deals"
      sidebar={<DealsSidebar source={source} onSourceChange={setSource} />}
    >
      <DealsSearch search={search} onSearchChange={setSearch} />

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
          <Table
            showSorterTooltip={false}
            columns={columns}
            loading={isLoading}
            dataSource={leads?.items}
            rowKey={(u) => u.id}
            rowSelection={{
              type: 'checkbox',
            }}
            bordered
            pagination={{
              current: page,
              pageSize: limit,
              total: leads?.meta.totalItems,
              defaultPageSize: 10,
              onChange: (page, limit) => {
                setPage(page)
                setLimit(limit || 10)
              },
            }}
          />
        </div>
      </div>
    </DealsViewLayout>
  )
}
