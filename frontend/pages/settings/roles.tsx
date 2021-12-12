import ActionPanel from '@components/Settings/Role/ActionPanel'
import AvailableActionPanel from '@components/Settings/Role/AvailableActionPanel'
import SettingsLayout from '@components/Settings/SettingsLayout'
import Input from '@utils/components/Input'
import { useQueryState } from '@utils/hooks/useQueryState'
import { getSessionToken } from '@utils/libs/getToken'
import { Actions, Role } from '@utils/models/role'
import { getRoles, updateRole } from '@utils/service/role'
import { GetServerSideProps } from 'next'
import { useEffect, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import {
  dehydrate,
  QueryClient,
  useQuery,
  useMutation,
  useQueryClient,
} from 'react-query'
import { DragDropContext, OnDragEndResponder } from 'react-beautiful-dnd'
import { notification } from 'antd'

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
  const { register, watch } = useForm<FormData>()

  const changedRole = watch('role')

  useEffect(() => {
    setSelectedRoleName(changedRole)
  }, [changedRole])

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
          actions: [...selectedRole.actions, res.draggableId as Actions],
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
            <button className="crm-button">Delete</button>
            <button className="crm-button">
              <span className="fa fa-plus mr-2" />
              Add New Role
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={dndUpdate}>
          <div className="w-full grid grid-cols-[1fr,30px,1fr] gap-4 h-[calc(100vh-60px-102px)] mt-8 text-gray-700">
            <ActionPanel role={selectedRole} />
            <div className=""></div>
            <AvailableActionPanel data={selectedRole} />
          </div>
        </DragDropContext>
      </>
    </SettingsLayout>
  )
}
