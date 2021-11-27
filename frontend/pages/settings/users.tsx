import Search from '@components/Settings/Search'
import SettingsLayout from '@components/Settings/SettingsLayout'
import { getUsers } from '@utils/service/user'
import { getSessionToken } from '@utils/libs/getToken'
import { Table, TableColumnType } from 'antd'
import { GetServerSideProps } from 'next'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import { Role, User, UserStatus } from '@utils/models/user'
import { useQueryState } from '@utils/hooks/useQueryState'
import ButtonAddUser from '@components/Settings/ButtonAddUser'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query: q,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  const page = Number(q.page) || 1
  const limit = Number(q.limit) || 10
  const search = q.search as string | undefined
  const role = q.role as Role | undefined
  const status = q.status as UserStatus | undefined

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['users', page, limit, search || '', role || '', status || ''],
        getUsers({ limit, page, search, role, status }, token),
      ),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

const columns: TableColumnType<User>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: { compare: (a, b) => a.name.localeCompare(b.name) },
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: { compare: (a, b) => a.email.localeCompare(b.email) },
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    sorter: { compare: (a, b) => a.role[0].localeCompare(b.role[0]) },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    sorter: { compare: (a, b) => a.status.localeCompare(b.status) },
  },
]

export default function UsersSettings() {
  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')

  const [search, setSearch] = useQueryState<string | undefined>('query')
  const [role, setRole] = useQueryState<Role | undefined>('role')
  const [status, setStatus] = useQueryState<UserStatus | undefined>('status')

  const { data: users, isLoading } = useQuery(
    ['users', page, limit, search, role || '', status || ''],
    getUsers({ limit, page, search, role, status }),
  )

  const [start, end, total] = usePaginateItem(users)

  return (
    <SettingsLayout title="CRM | Users">
      <div className="flex flex-row">
        <Search
          loading={isLoading}
          onQueryChange={setSearch}
          onRoleChange={setRole}
          onStatusChange={setStatus}
        />
        <ButtonAddUser />
      </div>

      <div className="mt-4">
        {search && (
          <div className="mb-2">
            Showing from {start} to {end} of {total} results.
          </div>
        )}
        <Table
          showSorterTooltip={false}
          columns={columns}
          loading={isLoading}
          dataSource={users?.items}
          rowSelection={{
            type: 'checkbox',
          }}
          bordered
          pagination={{
            current: page,
            total: users?.meta.totalItems,
            onChange: (page, limit) => {
              setPage(page)
              setLimit(limit || 10)
            },
          }}
        />
      </div>
    </SettingsLayout>
  )
}
