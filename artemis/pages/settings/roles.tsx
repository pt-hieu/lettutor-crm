import { Space, Table, TableColumnType, notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useCallback, useState } from 'react'
import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'

import CreateRoleModal from '@components/Settings/Role/CreateRoleModal'
import UpdateRoleModal from '@components/Settings/Role/UpdateRoleModal'
import SettingsLayout from '@components/Settings/SettingsLayout'

import Confirm from '@utils/components/Confirm'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useModal } from '@utils/hooks/useModal'
import { getSessionToken } from '@utils/libs/getToken'
import { ActionType, DefaultModule, Role } from '@utils/models/role'
import { deleteRole as deleteRoleService, getRoles } from '@utils/service/role'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const client = new QueryClient()
  const token = getSessionToken(ctx.req.cookies)

  if (token) {
    await Promise.all([
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

export default function SettingRoles() {
  const client = useQueryClient()
  const { data: roles, isLoading } = useQuery(
    'roles',
    getRoles<Role[]>({ shouldNotPaginate: true }),
  )

  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined)
  const [createRole, openCreateRole, closeCreateRole] = useModal()
  const [updateRoleVisible, openUpdateRole, closeUpdateRole] = useModal()

  const auth = useAuthorization()

  const { mutateAsync: deleteMutateAsync, isLoading: isDeleting } = useMutation(
    'delete-role',
    deleteRoleService,
    {
      onSuccess() {
        client.refetchQueries('roles')
        notification.success({ message: 'Delete role successfully' })
      },
      onError() {
        notification.error({ message: 'Delete role unsuccessfully' })
      },
    },
  )

  const deleteRole = useCallback(
    (id: string) => () => {
      deleteMutateAsync({ id })
    },
    [],
  )

  const updateRole = (updatedRole: Role) => () => {
    setSelectedRole(updatedRole)
    openUpdateRole()
  }

  const columns: TableColumnType<Role>[] = [
    Table.SELECTION_COLUMN,
    Table.EXPAND_COLUMN,
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: { compare: (a, b) => a.name.localeCompare(b.name) },
    },
    Table.SELECTION_COLUMN,
  ]

  if (auth(ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY, DefaultModule.ROLE)) {
    columns.push({
      title: 'Action',
      key: 'action',
      render: (_, record: Role) => (
        <>
          <Space>
            {auth(ActionType.CAN_DELETE_ANY, DefaultModule.ROLE) &&
              !record.default && (
                <Confirm
                  asInform={(record?.usersCount || 0) > 0 || record.default}
                  message={
                    (record?.usersCount || 0) > 0
                      ? `This role can not be deleted. There still ${record?.usersCount} users attached to this role.`
                      : record.default
                      ? "This role can not be deleted since it's reserved"
                      : 'Are you sure you want to delete this role'
                  }
                  onYes={deleteRole(record.id)}
                >
                  <button
                    disabled={isLoading || isDeleting}
                    className="crm-button-danger"
                  >
                    Delete
                  </button>
                </Confirm>
              )}

            {auth(
              ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
              DefaultModule.ROLE,
            ) &&
              !record.default && (
                <button onClick={updateRole(record)} className="crm-button">
                  Edit
                </button>
              )}
          </Space>
        </>
      ),
    })
  }

  return (
    <SettingsLayout title="Roles | CRM">
      <>
        <div className="flex justify-between">
          <div className="flex gap-2">
            {auth(ActionType.CAN_CREATE_NEW, DefaultModule.ROLE) && (
              <button onClick={openCreateRole} className="crm-button">
                <span className="fa fa-plus mr-2" />
                Add New Role
              </button>
            )}
            <CreateRoleModal visible={createRole} close={closeCreateRole} />
            {selectedRole && (
              <UpdateRoleModal
                role={selectedRole}
                visible={updateRoleVisible}
                close={closeUpdateRole}
              />
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full flex flex-col gap-4">
            <Table
              showSorterTooltip={false}
              columns={columns}
              loading={isLoading}
              dataSource={roles}
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
              expandable={{
                expandedRowRender: (record) => {
                  const actionTargets = record.actions
                    ?.map((action) => action.target)
                    .filter(
                      (value, index, self) => self.indexOf(value) === index,
                    )

                  return (
                    <div>
                      {actionTargets.map((target) => {
                        const action = record.actions?.filter(
                          (action) => action.target === target,
                        )

                        return (
                          <div>
                            <h2 className="font-semibold mb-3 text-[17px] capitalize">
                              {target}
                            </h2>
                            {action?.map(({ id, type, target }, index) => (
                              <div
                                key={id + 'select'}
                                className="flex gap-2 items-center mb-2"
                              >
                                <label
                                  htmlFor={id + index + 'select'}
                                  className="crm-label after:content-[''] mb-0"
                                >
                                  {type}
                                </label>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )
                },
              }}
            />
          </div>
        </div>
      </>
    </SettingsLayout>
  )
}
