import Search from '@components/Settings/Search'
import SettingsLayout from '@components/Settings/SettingsLayout'
import { getUsers } from '@utils/service/user'
import { getSessionToken } from '@utils/libs/getToken'
import { Table, TableColumnType } from 'antd'
import { GetServerSideProps } from 'next'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import { Role, User } from '@utils/models/user'
import { useQueryState } from '@utils/hooks/useQueryState'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  const { page, limit, q, role } = query

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['users', page || 1, limit || 10, q || '', role || ''],
        getUsers(token),
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
  { title: 'Role', dataIndex: 'role', key: 'role' },
]

export default function UsersSettings() {
  const [page, setPage] = useQueryState('page', 1)
  const [limit, setLimit] = useQueryState('limit', 10)

  const [q, setQ] = useQueryState('q', '')
  const [role, setRole] = useQueryState<Role | ''>('role', '')

  const { data: users } = useQuery(
    ['users', page, limit, q, role],
    getUsers(undefined, { limit, page, query: q, role }),
  )

  return (
    <SettingsLayout title="CRM | Users">
      <Search
        query={q}
        role={role}
        onQueryChange={setQ}
        onRoleChange={setRole}
      />
      <div className="mt-4">
        <Table
          columns={columns}
          dataSource={users!}
          rowSelection={{
            type: 'checkbox',
          }}
          bordered
          pagination={{
            hideOnSinglePage: true,
            current: page,
            total: users?.length,
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
