import { menuItemClass } from '@utils/components/Header'
import Input from '@utils/components/Input'
import useOnClickOutside from '@utils/hooks/useOnClickOutSide'
import { Role } from '@utils/models/user'
import { Modal, notification } from 'antd'
import { emailReg } from 'pages/reset-password'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  name: string
  email: string
  role: Role | ''
}

const initialValue: FormData = {
  name: '',
  email: '',
  role: '',
}

const ButtonAddUser = () => {
  const [showMenu, setShowMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const menuRef = useRef(null)

  useOnClickOutside(menuRef, () => setShowMenu(false))

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<FormData>({
    shouldUseNativeValidation: true,
  })

  const onAddUser = handleSubmit((data) => {
    const { name, email, role } = data
    console.log(data)
    let err = false
    if (!name) {
      err = true
      setError('name', { message: 'Name is required.' })
    }
    if (!email) {
      err = true
      setError('email', { message: 'Email is required.' })
    }
    if (!role) {
      err = true
      setError('role', { message: 'Please select role.' })
    }
    if (email && !emailReg.test(email)) {
      err = true
      setError('email', {
        message: 'Please enter a valid email address.',
      })
    }

    if (!err) {
      reset(initialValue)
      setShowModal(false)
      notification.success({
        message: 'Add new user successfully.',
      })
    }
  })

  return (
    <div className="flex items-center ml-2">
      <button
        className="h-full px-4 tracking-wide bg-blue-600 text-white font-medium rounded-l-md hover:bg-blue-500 focus:outline-none focus:bg-blue-600"
        onClick={() => setShowModal(!showModal)}
      >
        <span className="fa fa-plus mr-2"></span>New User
      </button>

      <button
        className="relative z-10 block h-full bg-blue-600 rounded-r-md p-2 px-3 border-blue-300 border-l hover:bg-blue-500 focus:outline-none focus:bg-blue-600"
        onClick={() => setShowMenu(!showMenu)}
        ref={menuRef}
      >
        <span className="fa fa-caret-down text-white" />
      </button>

      <div className="relative">
        {showMenu && (
          <div className="absolute right-0 top-4 mt-2 w-48 bg-white rounded-sm overflow-hidden shadow-xl z-20 py-2">
            <button
              className={
                menuItemClass + ' w-full px-5 font-semibold text-gray-700'
              }
            >
              <span className="fa fa-upload mr-4" />
              Import User
            </button>
          </div>
        )}
      </div>
      <Modal
        visible={showModal}
        onCancel={() => setShowModal(false)}
        onOk={onAddUser}
        okText="Save"
        title="Add New User"
        maskClosable={false}
      >
        <div className="grid">
          <div className="grid grid-cols-12 my-4">
            <div className="col-span-2 flex items-center">
              <label htmlFor="name" className="crm-label m-0">
                Name
              </label>
            </div>
            <div className="col-span-10">
              <Input
                error={errors.name?.message}
                props={{
                  type: 'text',
                  className: 'w-full text-sm p-3',
                  ...register('name'),
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-12 mb-4">
            <div className="col-span-2 flex items-center">
              <label htmlFor="email" className="crm-label m-0">
                Email
              </label>
            </div>
            <div className="col-span-10">
              <Input
                error={errors.email?.message}
                props={{
                  type: 'email',
                  className: 'w-full text-sm p-3',
                  placeholder: 'An invitation link will be sent to this email',
                  ...register('email'),
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-12 mb-4">
            <div className="col-span-2 flex items-center">
              <label htmlFor="role" className="crm-label m-0">
                Role
              </label>
            </div>
            <div className="col-span-10">
              <Input
                error={errors.role?.message}
                as="select"
                props={{
                  className: 'w-full text-sm p-3',
                  ...register('role'),
                  children: (
                    <>
                      <option value={''}>Select a role</option>
                      {Object.values(Role).map((role) => (
                        <option key={role} value={role}>
                          {role}
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
