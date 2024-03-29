import { Space, Table, TableColumnType, notification } from 'antd'
import { GetServerSideProps } from 'next'
import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'

import ButtonAddUser from '@components/Settings/ButtonAddUser'
import ButtonUpdateUser from '@components/Settings/ButtonUpdateUser'
import Search from '@components/Settings/Search'
import SettingsLayout from '@components/Settings/SettingsLayout'

import Animate from '@utils/components/Animate'
import Confirm from '@utils/components/Confirm'
import Paginate from '@utils/components/Paginate'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useModal } from '@utils/hooks/useModal'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { useQueryState } from '@utils/hooks/useQueryState'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { ActionType, DefaultModule, Role } from '@utils/models/role'
import { User, UserStatus } from '@utils/models/user'
import { getRoles } from '@utils/service/role'
import {
  batchDelete,
  getUsers,
  invalidateAddUserToken,
  updateStatus,
} from '@utils/service/user'

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
    notFound: await checkActionError(req, {
      action: ActionType.CAN_VIEW_ALL,
      moduleName: DefaultModule.USER,
    }),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default function UsersSettings() {
  const client = useQueryClient()

  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')

  const [search, setSearch] = useQueryState<string>('query')
  const [role, setRole] = useQueryState<string>('role')
  const [status, setStatus] = useQueryState<UserStatus>('status')

  const [confirm, openConfirm, closeConfirm] = useModal()

  const [session] = useTypedSession()
  const id = session?.user.id

  const { data: users, isLoading } = useQuery(
    ['users', page || 1, limit || 10, role || '', search || '', status || ''],
    getUsers({ limit, page, role, search, status }),
  )

  const [start, end, total] = usePaginateItem(users)

  const auth = useAuthorization()
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation('update-user-status', updateStatus, {
    onSuccess: (res: User) => {
      queryClient.refetchQueries(['users'])
      notification.success({
        message: `${
          res.status === UserStatus.ACTIVE ? 'Activate' : 'Deactivate'
        } user successfully.`,
      })
    },
    onError: () => {
      notification.error({
        message: 'Activate - Deactivate user unsuccessfully.',
      })
    },
  })

  const { mutateAsync: resendEmailMutate } = useMutation(
    'invalidate-add-user',
    invalidateAddUserToken,
    {
      onSuccess: () => {
        queryClient.refetchQueries(['users'])
        notification.success({
          message: 'Re-send add user email successfully.',
        })
      },
      onError: () => {
        notification.error({
          message: 'Re-send add user email unsuccessfully.',
        })
      },
    },
  )

  const activate = (userId: string) => () => {
    mutateAsync({ userId, status: UserStatus.ACTIVE })
  }

  const deactivate = (userId: string) => () => {
    mutateAsync({ userId, status: UserStatus.INACTIVE })
  }

  const resend = (userId: string) => () => {
    resendEmailMutate({ userId })
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

  if (auth(ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY, DefaultModule.USER)) {
    columns.push({
      title: 'Action',
      key: 'action',
      render: (_, record: User) => (
        <>
          {record.id !== id && (
            <Space>
              {record.status === UserStatus.ACTIVE && (
                <Confirm
                  message="Are you sure you want to deactivate this user?"
                  title="Deactivate user"
                  onYes={deactivate(record.id)}
                >
                  <button className="crm-button-danger">Deactivate</button>
                </Confirm>
              )}

              {record.status === UserStatus.INACTIVE && (
                <Confirm
                  message="Are you sure you want to activate this user?"
                  title="Activate user"
                  onYes={activate(record.id)}
                >
                  <button className="crm-button">Activate</button>
                </Confirm>
              )}

              {record.status === UserStatus.UNCONFIRMED && (
                <Confirm
                  message="Are you sure you want to re-send invitation email?"
                  title="Re-send invitation email"
                  onYes={resend(record.id)}
                >
                  <button className="crm-button">Re-send</button>
                </Confirm>
              )}

              <ButtonUpdateUser user={record} />
            </Space>
          )}
        </>
      ),
    })
  }

  const { data: ids } = useQuery<string[]>('selected-userIds', {
    enabled: false,
  })

  const { mutateAsync: deleteUserMutate, isLoading: isDeleting } = useMutation(
    'delete-users',
    batchDelete,
    {
      onSuccess() {
        client.setQueryData('selected-userIds', [])
        notification.success({ message: 'Delete users successfully' })
      },
      onError() {
        notification.error({ message: 'Delete users unsuccessfully' })
      },
      onSettled() {
        client.refetchQueries('users')
      },
    },
  )

  return (
    <SettingsLayout title="CRM | Users">
      <div className="flex justify-between">
        <Search
          loading={isLoading}
          onQueryChange={setSearch}
          onRoleChange={setRole}
          onStatusChange={setStatus}
        />

        <div className="flex gap-2">
          {!!ids?.length &&
            auth(ActionType.CAN_DELETE_ANY, DefaultModule.USER) && (
              <button
                disabled={isDeleting}
                onClick={openConfirm}
                className="crm-button-danger"
              >
                <span className="fa fa-trash mr-2" />
                Delete
              </button>
            )}

          {auth(ActionType.CAN_CREATE_NEW, DefaultModule.USER) && (
            <ButtonAddUser />
          )}
        </div>
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

        <div className="w-full flex flex-col gap-4">
          <Table
            showSorterTooltip={false}
            columns={columns}
            loading={isLoading}
            dataSource={users?.items}
            rowKey={(u) => u.id}
            rowSelection={{
              type: 'checkbox',
              onChange: (keys) =>
                client.setQueryData(
                  'selected-userIds',
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
            totalPage={users?.meta.totalPages}
            onPageChange={setPage}
            showJumpToHead
            showQuickJump
          />
        </div>
      </div>
      <Confirm
        visible={confirm}
        close={closeConfirm}
        danger
        message="These selected users will be deleted permanently"
        okText="Yes, I understand"
        onYes={() => deleteUserMutate(ids || [])}
      />
    </SettingsLayout>
  )
}
