import LeadsViewLayout from '@components/Leads/LeadsViewLayout'
import ButtonAdd from '@utils/components/ButtonAdd'
import { menuItemClass } from '@utils/components/Header'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getSessionToken } from '@utils/libs/getToken'
import { Lead } from '@utils/models/lead'
import { Role, UserStatus } from '@utils/models/user'
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

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['leads', page, limit, search || ''],
        getLeads({ limit, page, search }, token),
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
    dataIndex: 'name',
    key: 'name',
    sorter: { compare: (a, b) => a.name.localeCompare(b.name) },
    fixed: 'left',
  },
  {
    title: 'Company',
    dataIndex: 'company',
    key: 'company',
    sorter: { compare: (a, b) => a.company.localeCompare(b.email) },
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: { compare: (a, b) => a.email.localeCompare(b.email) },
  },

  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
    sorter: { compare: (a, b) => a.phone.localeCompare(b.phone) },
  },
  {
    title: 'Lead Source',
    dataIndex: 'leadSource',
    key: 'leadSource',
    sorter: {
      compare: (a, b) => a.leadSource.localeCompare(b.leadSource),
    },
  },
  {
    title: 'Lead Owner',
    dataIndex: 'leadOwner',
    key: 'leadOwner',
    sorter: {
      compare: (a, b) => a.leadOwner.name.localeCompare(b.leadOwner.name),
    },
    render: (_, record) => record.leadOwner.name,
  },
]

export default function LeadsViews() {
  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')

  const [search, setSearch] = useQueryState<string | undefined>('query')
  const [role, setRole] = useQueryState<Role | undefined>('role')
  const [status, setStatus] = useQueryState<UserStatus | undefined>('status')

  const router = useRouter()

  const { data: leads, isLoading } = useQuery(
    ['leads', page, limit, search],
    getLeads({ limit, page, search }),
  )

  const [start, end, total] = usePaginateItem(leads)

  return (
    <LeadsViewLayout title="CRM | Leads">
      <div className="flex justify-end pt-1 pl-[2px]">
        {/* <Search
          loading={isLoading}
          onQueryChange={setSearch}
          onRoleChange={setRole}
          onStatusChange={setStatus}
        /> */}
        <ButtonAdd
          title="Create Lead"
          onClick={() => router.push('/leads/add-lead')}
          menuItems={
            <>
              <button className={menuItemClass}>
                <span className="fa fa-upload mr-4" />
                Import Leads
              </button>
              <button className={menuItemClass}>
                <span className="fa fa-book mr-4" />
                Import Notes
              </button>
            </>
          }
        />
      </div>

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
            //Fixme
            columns={columns as any}
            loading={isLoading}
            dataSource={leads?.items}
            //Fixme
            rowKey={(u) => u.id || ''}
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
