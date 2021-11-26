import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'
import { changePassword } from '@utils/service/user'
import { notification } from 'antd'
import { signOut } from 'next-auth/client'
import { useCallback } from 'react'
import { useForm, RegisterOptions } from 'react-hook-form'
import { useMutation } from 'react-query'
import { passwordReg } from './reset-password'

interface FormData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const validatePassword = (
  data: FormData,
): { key: keyof FormData; message: string } | null => {
  const oldPassword = data.oldPassword
  const newPassword = data.newPassword
  const confirmPassword = data.confirmPassword

  if (newPassword && !passwordReg.test(newPassword)) {
    return {
      key: 'newPassword',
      message:
        'Password must be at least 8 characters, 1 letter, 1 number and 1 special character',
    }
  }

  if (newPassword && oldPassword === newPassword) {
    return {
      key: 'newPassword',
      message: 'New password must be different from the old password',
    }
  }

  if (confirmPassword !== newPassword) {
    return {
      key: 'confirmPassword',
      message: 'Passwords do not match',
    }
  }

  return null
}

const requireRule: (field: string) => RegisterOptions = (field) => ({
  required: {
    message: field + ' is required',
    value: true,
  },
})

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<FormData>()

  const { mutateAsync, isLoading } = useMutation(
    'change-password',
    changePassword,
    {
      onSuccess() {
        notification.success({ message: 'Change password successfully.' })
        notification.info({ message: 'Sign out in 1s' })
        reset()
        setTimeout(() => {
          signOut()
        }, 1000)
      },
      onError() {
        notification.error({ message: 'Change password unsuccessfully.' })
      },
    },
  )

  const submit = useCallback(
    handleSubmit((data) => {
      const res = validatePassword(data)

      if (res) {
        return setError(res.key, {
          message: res.message,
        })
      }

      mutateAsync(data)
    }),
    [],
  )

  return (
    <Layout requireLogin={true}>
      <div className="crm-container grid w-full place-content-center">
        <form
          noValidate
          onSubmit={submit}
          className="min-h-[300px] m-auto p-4 border-b-2 grid place-content-center"
        >
          <h1 className="mb-8 text-2xl font-medium text-center text-blue-600">
            Change Password
          </h1>

          <div className="mb-4">
            <label htmlFor="oldPassword" className="crm-label">
              Old Password
            </label>
            <Input
              error={errors.oldPassword?.message}
              props={{
                type: 'password',
                className: 'w-full',
                ...register('oldPassword', requireRule('Old Password')),
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="newPassword" className="crm-label">
              New Password
            </label>
            <Input
              error={errors.newPassword?.message}
              props={{
                type: 'password',
                className: 'w-full',
                ...register('newPassword', requireRule('New Password')),
              }}
            />
          </div>

          <div className="mb-4 min-w-[450px]">
            <label htmlFor="confirmPassword" className="crm-label">
              Confirm Password
            </label>
            <Input
              error={errors.confirmPassword?.message}
              props={{
                type: 'password',
                className: 'w-full',
                ...register('confirmPassword', requireRule('Confirm Password')),
              }}
            />
          </div>

          <div className="mb-8">
            <button disabled={isLoading} className="crm-button w-full">
              <Loading on={isLoading}>Submit</Loading>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
