import { Divider, Modal, notification } from 'antd'
import { requireRule } from 'pages/change-password'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import Input from '@utils/components/Input'
import { useModal } from '@utils/hooks/useModal'
import { IErrorResponse } from '@utils/libs/functionalTryCatch'
import { Role } from '@utils/models/role'
import { User } from '@utils/models/user'
import { updateUser as updateUserService } from '@utils/service/user'

interface FormData {
  name: string
  roleId: string
}

type Props = {
  user: User
}

const ButtonUpdateUser = ({ user }: Props) => {
  const initialValue: FormData = {
    name: user.name,
    roleId: user.roles[0].id,
  }

  const [modal, showModal, hideModal] = useModal()

  const { data: roles } = useQuery<Role[]>('roles', { enabled: false })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<FormData>()

  const queryClient = useQueryClient()
  const { mutateAsync: updateUserAsync } = useMutation(
    'update-user',
    updateUserService(user.id),
    {
      onSuccess: () => {
        queryClient.refetchQueries('users')
        hideModal()
        notification.success({
          message: 'Update user successfully.',
        })
      },
      onError: ({ response }: IErrorResponse) => {
        if (response) {
          notification.error({ message: response.data.message })
          return
        }
        notification.error({ message: 'Update user unsuccessfully' })
      },
    },
  )

  const updateUser = handleSubmit((data) => {
    updateUserAsync(data)
  })

  useEffect(() => {
    reset(initialValue)
  }, [modal])

  return (
    <div className="flex items-center ml-2">
      <button className="crm-button" onClick={showModal}>
        Update
      </button>

      <Modal
        visible={modal}
        onCancel={hideModal}
        footer={
          <div className="flex gap-2 justify-end">
            <button onClick={updateUser} className="crm-button">
              Submit
            </button>

            <button className="crm-button-outline" onClick={hideModal}>
              Cancel
            </button>
          </div>
        }
      >
        <h1 className="font-medium text-gray-700 text-xl">Update User</h1>

        <Divider />

        <div className="grid">
          <div className="grid grid-cols-12 my-4">
            <label htmlFor="name" className="col-span-2 mt-[10px] crm-label">
              Name
            </label>
            <div className="col-span-10">
              <Input
                error={errors.name?.message}
                props={{
                  id: 'name',
                  type: 'text',
                  className: 'w-full text-sm p-3',
                  ...register('name', requireRule('Name')),
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-12 mb-4">
            <label
              htmlFor="userRole"
              className="col-span-2 mt-[10px] crm-label"
            >
              Role
            </label>
            <div className="col-span-10">
              <Input
                error={errors.roleId?.message}
                as="select"
                props={{
                  id: 'userRole',
                  className: 'w-full text-sm p-3',
                  ...register('roleId', requireRule('Role')),
                  children: (
                    <>
                      <option value={''}>Select a role</option>
                      {roles?.map(({ id, name }) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </>
                  ),
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ButtonUpdateUser
