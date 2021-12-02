import LeadsViewLayout from '@components/Leads/LeadsViewLayout'
import Search from '@components/Leads/Search'
import LeadSidebar from '@components/Leads/Sidebar'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getSessionToken } from '@utils/libs/getToken'
import { Lead, LeadSource, LeadStatus } from '@utils/models/lead'
import { getLeads } from '@utils/service/lead'
import { Table, TableColumnType } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
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
  const status = q.status as LeadStatus[] | undefined

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['leads', page, limit, search || '', source || [], status || []],
        getLeads({ limit, page, search, source, status }, token),
      ),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

const columns: TableColumnType<Lead>[] = [
  {
    title: 'Lead Name',
    dataIndex: 'fullName',
    key: 'name',
    sorter: { compare: (a, b) => a.fullName.localeCompare(b.fullName) },
    fixed: 'left',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: { compare: (a, b) => a.email.localeCompare(b.email) },
  },
  {
    title: 'Phone Number',
    dataIndex: 'phoneNum',
    key: 'phone',
    sorter: {
      compare: (a, b) => a.phoneNum?.localeCompare(b.phoneNum || '') || -1,
    },
  },
  {
    title: 'Source',
    dataIndex: 'source',
    key: 'source',
    sorter: {
      compare: (a, b) => a.source.localeCompare(b.source),
    },
  },
  {
    title: 'Owner',
    dataIndex: 'owner',
    key: 'owner',
    sorter: {
      compare: (a, b) => a.owner.name.localeCompare(b.owner.name),
    },
    render: (_, record) => record.owner.name,
  },
]

export default function LeadsViews() {
  const router = useRouter()

  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')

  const [search, setSearch] = useQueryState<string>('search')
  const [source, setSource] = useQueryState<Array<LeadSource>>('source', {
    isArray: true,
  })

  const [status, setStatus] = useQueryState<Array<LeadStatus>>('status', {
    isArray: true,
  })

  const { data: leads, isLoading } = useQuery(
    ['leads', page || 1, limit || 10, search || '', source || [], status || []],
    getLeads({ limit, page, search, source, status }),
  )

  const [start, end, total] = usePaginateItem(leads)

  return (
    <LeadsViewLayout
      title="CRM | Leads"
      sidebar={
        <LeadSidebar
          source={source}
          status={status}
          onSourceChange={setSource}
          onStatusChange={setStatus}
        />
      }
    >
      <Search search={search} onSearchChange={setSearch} />

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
            onRow={(record, rowIndex) => {
              return {
                onClick: () => router.push(`/leads/${record.id}`),
              }
            }}
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
    </LeadsViewLayout>
  )
}
