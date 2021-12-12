import Search from '@components/Settings/Search'
import SettingsLayout from '@components/Settings/SettingsLayout'
import { getUsers } from '@utils/service/user'
import { getRoles } from '@utils/service/role'
import { getSessionToken } from '@utils/libs/getToken'
import { Table, TableColumnType } from 'antd'
import { GetServerSideProps } from 'next'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import { User, UserStatus } from '@utils/models/user'
import { useQueryState } from '@utils/hooks/useQueryState'
import ButtonAddUser from '@components/Settings/ButtonAddUser'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import Animate from '@utils/components/Animate'
import { Role } from '@utils/models/role'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query: q,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  const page = Number(q.page) || 1
  const limit = Number(q.limit) || 10
  const search = q.search as string | undefined
  const role = q.role as string | undefined
  const status = q.status as UserStatus | undefined

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['users', page, limit, role || '', search || '', status || ''],
        getUsers({ limit, page, role, search, status }, token),
      ),
      client.prefetchQuery(
        'roles',
        getRoles({ shouldNotPaginate: true }, token),
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
    title: 'Roles',
    dataIndex: 'roles',
    key: 'roles',
    sorter: {
      compare: (a, b) => a.roles[0].name.localeCompare(b.roles[0].name),
    },
    render: (v: Role[]) => v.map((role) => role.name).join(', '),
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

  const [search, setSearch] = useQueryState<string>('query')
  const [role, setRole] = useQueryState<string>('role')
  const [status, setStatus] = useQueryState<UserStatus>('status')

  const { data: users, isLoading } = useQuery(
    ['users', page || 1, limit || 10, role || '', search || '', status || ''],
    getUsers({ limit, page, role, search, status }),
  )

  const [start, end, total] = usePaginateItem(users)

  return (
    <SettingsLayout title="CRM | Users">
      <div className="flex justify-between">
        <Search
          loading={isLoading}
          onQueryChange={setSearch}
          onRoleChange={setRole}
          onStatusChange={setStatus}
        />
        <ButtonAddUser />
      </div>

      <div className="mt-4">
        <Animate
          shouldAnimateOnExit
          on={search}
          presenceProps={{ presenceAffectsLayout: true }}
          transition={{ duration: 0.2 }}
          animation={{
            start: { opacity: 0, height: 0, marginBottom: 0 },
            animate: { opacity: 1, height: 'auto', marginBottom: 8 },
            end: { opacity: 0, height: 0, marginBottom: 0 },
          }}
        >
          Showing from {start} to {end} of {total} results.
        </Animate>
        <Table
          showSorterTooltip={false}
          columns={columns}
          loading={isLoading}
          dataSource={users?.items}
          rowKey={(u) => u.id}
          rowSelection={{
            type: 'checkbox',
          }}
          bordered
          pagination={{
            current: page,
            total: users?.meta.totalItems,
            defaultPageSize: 10,
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
