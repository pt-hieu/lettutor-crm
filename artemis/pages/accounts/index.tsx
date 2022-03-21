import { Table, TableColumnType } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { QueryClient, dehydrate, useQuery, useQueryClient } from 'react-query'

import AccountsViewLayout from '@components/Accounts/AccountsViewLayout'
import Search from '@components/Accounts/Search'
import AccountsSidebar from '@components/Accounts/Sidebar'

import Paginate from '@utils/components/Paginate'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getSessionToken } from '@utils/libs/getToken'
import { Account, AccountType } from '@utils/models/account'
import { getAccounts } from '@utils/service/account'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query: q,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  const page = Number(q.page) || 1
  const limit = Number(q.limit) || 10
  const search = q.search as string | undefined
  const type = q.type as AccountType[] | undefined

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['accounts', page, limit, search || '', type || []],
        getAccounts({ limit, page, search, type }, token),
      ),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

const columns: TableColumnType<Account>[] = [
  {
    title: 'Account Name',
    dataIndex: 'fullName',
    key: 'fullName',
    sorter: { compare: (a, b) => a.fullName.localeCompare(b.fullName) },
    fixed: 'left',
    render: (_, { id, fullName }) => (
      <Link href={`/accounts/${id}`}>
        <a className="crm-link underline hover:underline">{fullName}</a>
      </Link>
    ),
  },
  {
    title: 'Account Owner',
    dataIndex: 'owner',
    key: 'owner',
    sorter: {
      compare: (a, b) => a.owner?.name.localeCompare(b.owner?.name || '') || 1,
    },
    render: (_, { owner }) => owner?.name,
  },
  {
    title: 'Phone Number',
    dataIndex: 'phoneNum',
    key: 'phoneNum',
    sorter: {
      compare: (a, b) => a.phoneNum?.localeCompare(b.phoneNum || '') || -1,
    },
  },
  {
    title: 'Account Type',
    dataIndex: 'type',
    key: 'type',
    sorter: {
      compare: (a, b) => a.type.localeCompare(b.type),
    },
  },
]

export default function AccountsView() {
  const client = useQueryClient()

  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')

  const [search, setSearch] = useQueryState<string>('search')
  const [type, setType] = useQueryState<Array<AccountType>>('type')

  const applySearch = (keyword: string | undefined) => {
    setPage(1)
    setSearch(keyword)
  }

  const applyFilter = (types: AccountType[] | undefined) => {
    setPage(1)
    setType(types)
  }

  const { data: accounts, isLoading } = useQuery(
    ['accounts', page || 1, limit || 10, search || '', type || []],
    getAccounts({ limit, page, search, type }),
  )

  const [start, end, total] = usePaginateItem(accounts)

  return (
    <AccountsViewLayout
      title="CRM | Accounts"
      sidebar={<AccountsSidebar type={type} onTypeChange={applyFilter} />}
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

        <div className="w-full flex flex-col gap-4">
          <Table
            showSorterTooltip={false}
            columns={columns}
            loading={isLoading}
            dataSource={accounts?.items}
            rowKey={(u) => u.id}
            rowSelection={{
              type: 'checkbox',
              onChange: (keys) =>
                client.setQueryData(
                  'selected-accountIds',
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
            totalPage={accounts?.meta.totalPages}
            onPageChange={setPage}
            showJumpToHead
            showQuickJump
          />
        </div>
      </div>
    </AccountsViewLayout>
  )
}
