import ButtonAdd from '@utils/components/ButtonAdd'
import { menuItemClass } from '@utils/components/Header'
import Input from '@utils/components/Input'
import Loading from '@utils/components/Loading'
import { useModal } from '@utils/hooks/useModal'
import { IErrorResponse } from '@utils/libs/functionalTryCatch'
import { Role } from '@utils/models/role'
import { addUser as addUserService } from '@utils/service/user'
import { Divider, Modal, notification } from 'antd'
import { requireRule } from 'pages/change-password'
import { emailReg } from 'pages/reset-password'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'

interface FormData {
  name: string
  email: string
  roleId: string
}

const initialValue: FormData = {
  name: '',
  email: '',
  roleId: '',
}

const validateData = (
  data: FormData,
): { key: keyof FormData; message: string } | null => {
  const { email } = data

  if (email && !emailReg.test(email)) {
    return { key: 'email', message: 'Please enter a valid email address.' }
  }

  return null
}

const ButtonAddUser = () => {
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

  const { isLoading, mutateAsync } = useMutation('add-user', addUserService, {
    onSuccess: () => {
      queryClient.invalidateQueries('users')
      reset(initialValue)
      hideModal()
      notification.success({
        message: 'Add new user successfully.',
      })
    },
    onError: ({ response }: IErrorResponse) => {
      if (response) {
        notification.error({ message: response.data.message })
        return
      }
      notification.error({ message: 'Add new user unsuccessfully' })
    },
  })

  const addUser = handleSubmit((data) => {
    const error = validateData(data)

    if (error) {
      return setError(error.key, {
        message: error.message,
      })
    }
    mutateAsync(data)
  })

  useEffect(() => {
    reset(initialValue)
  }, [modal])

  return (
    <div className="flex items-center ml-2">
      <ButtonAdd
        title="Add User"
        onClick={showModal}
        menuItems={
          <button className={menuItemClass}>
            <span className="fa fa-upload mr-4" />
            Import User
          </button>
        }
      />

      <Modal
        visible={modal}
        onCancel={hideModal}
        footer={
          <div className="flex gap-2 justify-end">
            <button onClick={addUser} className="crm-button">
              <Loading on={isLoading}>Submit</Loading>
            </button>

            <button className="crm-button-outline" onClick={hideModal}>
              Cancel
            </button>
          </div>
        }
      >
        <h1 className="font-medium text-gray-700 text-xl">Add New User</h1>

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
                  type: 'text',
                  className: 'w-full text-sm p-3',
                  ...register('name', requireRule('Name')),
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-12 mb-4">
            <label htmlFor="email" className="col-span-2 mt-[10px] crm-label">
              Email
            </label>
            <div className="col-span-10">
              <Input
                error={errors.email?.message}
                props={{
                  type: 'email',
                  className: 'w-full text-sm p-3',
                  placeholder: 'An invitation link will be sent to this email',
                  ...register('email', requireRule('Email')),
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

export default ButtonAddUser
