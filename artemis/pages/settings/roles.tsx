import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useCallback, useEffect, useMemo } from 'react'
import { DragDropContext, OnDragEndResponder } from 'react-beautiful-dnd'
import { useForm } from 'react-hook-form'
import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'

import ActionPanel from '@components/Settings/Role/ActionPanel'
import AvailableActionPanel from '@components/Settings/Role/AvailableActionPanel'
import CreateRoleModal from '@components/Settings/Role/CreateRoleModal'
import SettingsLayout from '@components/Settings/SettingsLayout'

import Confirm from '@utils/components/Confirm'
import Input from '@utils/components/Input'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useModal } from '@utils/hooks/useModal'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getSessionToken } from '@utils/libs/getToken'
import { Actions, Role } from '@utils/models/role'
import {
  deleteRole as deleteRoleService,
  getRoles,
  restore,
  updateRole,
} from '@utils/service/role'

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

type FormData = {
  role: string
}

export default function SettingRoles() {
  const client = useQueryClient()
  const { data: roles } = useQuery(
    'roles',
    getRoles<Role[]>({ shouldNotPaginate: true }),
  )

  const [selectedRoleName, setSelectedRoleName] = useQueryState<string>('role')
  const { register, watch } = useForm<FormData>({
    defaultValues: {
      role: selectedRoleName,
    },
  })

  const changedRole = watch('role')
  useEffect(() => {
    setSelectedRoleName(changedRole)
  }, [changedRole])

  const [createRole, openCreateRole, closeCreateRole] = useModal()

  const auth = useAuthorization()

  const selectedRole = useMemo(
    () => roles?.find((role) => role.name === selectedRoleName),
    [selectedRoleName, roles],
  )

  const { mutateAsync, isLoading } = useMutation(
    ['update-role', selectedRole?.id],
    updateRole(selectedRole?.id || ''),
    {
      onSuccess() {
        client.invalidateQueries('roles')
        notification.success({ message: 'Update role successfully' })
      },
      onError() {
        notification.error({ message: 'Update role unsuccessfully' })
      },
    },
  )

  const { mutateAsync: deleteMutateAsync, isLoading: isDeleting } = useMutation(
    ['delete-role', selectedRole?.id],
    deleteRoleService(selectedRole?.id || ''),
    {
      onSuccess() {
        client.invalidateQueries('roles')
        notification.success({ message: 'Delete role successfully' })
      },
      onError() {
        notification.error({ message: 'Delete role unsuccessfully' })
      },
    },
  )

  const { mutateAsync: restoreMutateAsync, isLoading: isRestoring } =
    useMutation(['restore-role'], restore, {
      onSuccess() {
        client.invalidateQueries('roles')
        notification.success({ message: 'Restore role successfully' })
      },
      onError() {
        notification.error({ message: 'Restore role unsuccessfully' })
      },
    })

  const restoreRole = useCallback(() => {
    if (!selectedRole) return
    restoreMutateAsync(selectedRole.id)
  }, [selectedRole])

  const deleteRole = useCallback(() => {
    deleteMutateAsync()
  }, [])

  const dndUpdate: OnDragEndResponder = useCallback(
    (res) => {
      if (!res.destination) return
      if (!selectedRole) return
      if (res.source.droppableId === res.destination.droppableId) return

      if (res.source.droppableId === 'action') {
        mutateAsync({
          actions: selectedRole.actions.filter(
            (action) => action !== res.draggableId,
          ),
        })
      }

      if (res.source.droppableId === 'available-action') {
        mutateAsync({
          actions: [...selectedRole.actions, res.draggableId],
        })
      }
    },
    [selectedRole],
  )

  return (
    <SettingsLayout title="Roles | CRM">
      <>
        <div className="flex justify-between">
          <form>
            <Input
              as="select"
              showError={false}
              props={{
                ...register('role'),
                children: (
                  <>
                    <option value="">Select a role</option>
                    {roles?.map(({ id, name }) => (
                      <option value={name} key={id}>
                        {name}
                      </option>
                    ))}
                  </>
                ),
              }}
            />
          </form>

          <div className="flex gap-2">
            {auth[Actions.Role.DELETE_ROLE] &&
              selectedRole &&
              !selectedRole.default && (
                <Confirm
                  asInform={
                    (selectedRole?.usersCount || 0) > 0 || selectedRole.default
                  }
                  message={
                    (selectedRole?.usersCount || 0) > 0
                      ? `This role can not be deleted. There still ${selectedRole?.usersCount} users attached to this role.`
                      : selectedRole.default
                      ? "This role can not be deleted since it's reserved"
                      : 'Are you sure you want to delete this role'
                  }
                  onYes={deleteRole}
                >
                  <button
                    disabled={isLoading || isDeleting}
                    className="crm-button-danger"
                  >
                    Delete
                  </button>
                </Confirm>
              )}

            {auth[Actions.Role.RESTORE_DEFAULT_ROLE] && selectedRole?.default && (
              <button
                disabled={isRestoring}
                onClick={restoreRole}
                className="crm-button"
              >
                <span className="fa fa-undo mr-2" />
                Restore
              </button>
            )}

            {auth[Actions.Role.CREATE_NEW_ROLE] && (
              <button onClick={openCreateRole} className="crm-button">
                <span className="fa fa-plus mr-2" />
                Add New Role
              </button>
            )}
            <CreateRoleModal visible={createRole} close={closeCreateRole} />
          </div>
        </div>

        <DragDropContext onDragEnd={dndUpdate}>
          <div className="w-full grid grid-cols-[1fr,30px,1fr] gap-4 h-[calc(100vh-60px-102px)] mt-8 text-gray-700">
            <ActionPanel
              disabled={
                isLoading || isDeleting || !auth[Actions.Role.EDIT_ROLE]
              }
              role={selectedRole}
            />

            <div className=""></div>

            <AvailableActionPanel
              disabled={
                isLoading || isDeleting || !auth[Actions.Role.EDIT_ROLE]
              }
              data={selectedRole}
            />
          </div>
        </DragDropContext>
      </>
    </SettingsLayout>
  )
}
