import { yupResolver } from '@hookform/resolvers/yup'
import { Divider, Modal, notification } from 'antd'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as yup from 'yup'

import Input from '@utils/components/Input'
import Loading from '@utils/components/Loading'
import { Role } from '@utils/models/role'
import { createRole, getActions, updateRole } from '@utils/service/role'

type Props = {
  visible: boolean
  close: () => void
  role: Role
}

type FormData = {
  name: string
  actionsId: string[]
}

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Name must not be empty')
    .typeError('Name must be a string')
    .max(100, 'Name must be at max 100 characters'),
})

export default function UpdateRoleModal({ role, close, visible }: Props) {
  const checkedActionId = role.actions.map((action) => action.id)
  const client = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: role.name,
      actionsId: [...checkedActionId],
    },
  })

  const { mutateAsync: updateMutateAsync, isLoading } = useMutation(
    'update-role',
    updateRole,
    {
      onSuccess() {
        client.refetchQueries('roles')
        notification.success({ message: 'Update role successfully' })
      },
      onError() {
        notification.error({ message: 'Update role unsuccessfully' })
      },
    },
  )

  const { data: allActions } = useQuery('actions', getActions())

  const actionTargets = allActions
    ?.map((action) => action.target)
    .filter((value, index, self) => self.indexOf(value) === index)
    .filter((target) => target !== 'admin')

  const submitUpdateRole = useCallback(
    handleSubmit((data) => {
      updateMutateAsync({ id: role.id, data })
      close()
    }),
    [],
  )

  useEffect(() => {
    reset({ actionsId: [] })
  }, [visible])

  return (
    <Modal
      visible={visible}
      onCancel={close}
      centered
      footer={
        <div className="w-full flex gap-2 justify-end">
          <button
            disabled={isLoading}
            onClick={submitUpdateRole}
            className="crm-button"
          >
            <Loading on={isLoading}>Submit</Loading>
          </button>
          <button
            onClick={close}
            disabled={isLoading}
            className="crm-button-outline"
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="font-medium text-[17px]">Update Role</div>
      <Divider />
      <div>
        <form onSubmit={submitUpdateRole}>
          <div className="mb-4 grid grid-cols-[100px,1fr]">
            <label htmlFor="name" className="crm-label pt-[8px]">
              Name
            </label>
            <Input
              error={errors.name?.message}
              wrapperClassname="w-full"
              props={{
                type: 'text',
                className: 'w-full',
                // use this because I don't know why the default value of hook form doesn't work
                defaultValue: `${role.name}`,
                ...register('name'),
              }}
            />
          </div>

          <div className="mb-4 grid grid-cols-[100px,1fr]">
            <div></div>
            <div className="p-4 border rounded-md flex flex-col gap-2 max-h-[300px] overflow-auto crm-scrollbar">
              {actionTargets?.map((target) => {
                const action = allActions?.filter(
                  (action) => action.target === target,
                )

                return (
                  <div key={target}>
                    <h2 className="font-semibold mb-3 text-[17px] capitalize">
                      {target}
                    </h2>
                    {action?.map(({ id, type, target }, index) => (
                      <div
                        key={id + 'select'}
                        className="flex gap-2 items-center mb-2"
                      >
                        <Input
                          showError={false}
                          props={{
                            ...register('actionsId'),
                            value: id,
                            id: id + index + 'select',
                            type: 'checkbox',
                            defaultChecked: checkedActionId.some(
                              (checkedId) => checkedId === id,
                            ),
                          }}
                        />
                        <label
                          htmlFor={id + index + 'select'}
                          className="crm-label after:content-[''] mb-0"
                        >
                          {type + ' ' + target}
                        </label>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}
