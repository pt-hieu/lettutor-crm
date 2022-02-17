import Search from '@components/Contacts/Search'
import ContactsSidebar from '@components/Contacts/Sidebar'
import ContactsViewLayout from '@components/Contacts/ViewLayout'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getSessionToken } from '@utils/libs/getToken'
import { Contact } from '@utils/models/contact'
import { LeadSource } from '@utils/models/lead'
import { getContacts } from '@utils/service/contact'
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
        ['contacts', page, limit, search || '', source || []],
        getContacts({ limit, page, search, source }, token),
      ),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

const columns: TableColumnType<Contact>[] = [
  {
    title: 'Contact Name',
    dataIndex: 'fullName',
    key: 'name',
    sorter: { compare: (a, b) => a.fullName.localeCompare(b.fullName) },
    fixed: 'left',
    render: (_, { id, fullName }) => (
      <Link href={`/contacts/${id}`}>
        <a className="crm-link underline hover:underline">{fullName}</a>
      </Link>
    ),
  },
  {
    title: 'Account Name',
    key: 'accountName',
    sorter: {
      compare: (a, b) => a.account?.fullName.localeCompare(b.account?.fullName),
    },
    render: (_, { account }) => account?.fullName,
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
      compare: (a, b) => a.owner?.name.localeCompare(b.owner?.name || '') || 1,
    },
    render: (_, record) => record.owner?.name,
  },
]

export default function ContactsView() {
  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')

  const [search, setSearch] = useQueryState<string>('search')
  const [source, setSource] = useQueryState<Array<LeadSource>>(
    'source',
    undefined,
    {
      isArray: true,
    },
  )

  const { data: leads, isLoading } = useQuery(
    ['contacts', page || 1, limit || 10, search || '', source || []],
    getContacts({ limit, page, search, source }),
  )

  const applySearch = (keyword: string | undefined) => {
    setPage(1)
    setSearch(keyword)
  }

  const applySourceFilter = (sources: LeadSource[] | undefined) => {
    setPage(1)
    setSource(sources)
  }

  const [start, end, total] = usePaginateItem(leads)

  return (
    <ContactsViewLayout
      title="CRM | Contacts"
      sidebar={
        <ContactsSidebar source={source} onSourceChange={applySourceFilter} />
      }
    >
      <Search search={search} onSearchChange={applySearch} />

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
    </ContactsViewLayout>
  )
}
