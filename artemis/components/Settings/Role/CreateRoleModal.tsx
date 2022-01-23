import Input from '@utils/components/Input'
import { Actions, Role } from '@utils/models/role'
import { Divider, Modal, notification } from 'antd'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from 'react-query'
import { createRole } from '@utils/service/role'
import { useCallback } from 'react'
import Loading from '@utils/components/Loading'

type Props = {
  visible: boolean
  close: () => void
}

type FormData = {} & Pick<Role, 'name' | 'actions'>

const schema = yup.object().shape({
  name: yup
    .string()
    .typeError('Name must be a string')
    .max(100, 'Name must be at max 100 characters'),
})

export default function CreateRoleModal({ close, visible }: Props) {
  const client = useQueryClient()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      actions: [],
    },
  })

  const actions = watch('actions')

  const { mutateAsync, isLoading } = useMutation('create-role', createRole, {
    onSuccess() {
      client.invalidateQueries('roles')
      notification.success({ message: 'Create role successfully' })
      close()
    },
    onError() {
      notification.error({ message: 'Create role unsuccessfully' })
    },
  })

  const submitRole = useCallback(
    handleSubmit((data) => {
      mutateAsync(data)
    }),
    [],
  )

  return (
    <Modal
      visible={visible}
      onCancel={close}
      centered
      footer={
        <div className="w-full flex gap-2 justify-end">
          <button
            disabled={isLoading}
            onClick={submitRole}
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
      <div className="font-medium text-[17px]">Create A Role</div>
      <Divider />

      <form onSubmit={submitRole}>
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
              ...register('name'),
            }}
          />
        </div>

        <div className="mb-4 grid grid-cols-[100px,1fr]">
          <label className="crm-label pt-[8px]">Actions</label>
          <div className="py-2">
            {(!actions || !actions.length) && 'Empty'}
            {actions?.join(', ')}
          </div>
        </div>
        <div className="mb-4 grid grid-cols-[100px,1fr]">
          <div></div>
          <div className="p-4 border rounded-md flex flex-col gap-2 max-h-[300px] overflow-auto crm-scrollbar">
            {Object.values(Actions)
              .map((scope) => Object.values(scope))
              .flat()
              .map((action, index) => (
                <div
                  key={action + 'select'}
                  className="flex gap-2 items-center"
                >
                  <Input
                    showError={false}
                    props={{
                      ...register('actions'),
                      value: action,
                      id: action + index + 'select',
                      type: 'checkbox',
                    }}
                  />
                  <label
                    htmlFor={action + index + 'select'}
                    className="crm-label after:content-[''] mb-0"
                  >
                    {action}
                  </label>
                </div>
              ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
