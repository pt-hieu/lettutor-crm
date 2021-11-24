import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'
import { getSessionToken } from '@utils/libs/getToken'
import { changePassword } from '@utils/service/user'
import { notification } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { GetServerSidePropsContext } from 'next'
import { signOut } from 'next-auth/client'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { passwordReg, variants } from './reset-password'

interface FormData {
  'old-password': string
  'new-password': string
  'confirm-password': string
}

export default function ChangePassword({ token }: { token: string }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>()

  const { mutateAsync, isLoading } = useMutation(
    'change-password',
    changePassword,
    {
      onSuccess({ error }) {
        if (error) {
          const { message } = error.response.data
          notification.error({ message })
          return
        }
        notification.success({ message: 'Change password successfully.' })
        setTimeout(() => {
          signOut()
        }, 1000)
      },
    },
  )

  const submit = useCallback(
    handleSubmit(async (data) => {
      let err = false

      const oldPassword = data['old-password']
      const newPassword = data['new-password']
      const confirmPassword = data['confirm-password']

      if (!oldPassword) {
        err = true
        setError('old-password', {
          message: 'Old password is required',
        })
      }

      if (!newPassword) {
        err = true
        setError('new-password', {
          message: 'New password is required',
        })
      }

      if (newPassword && !passwordReg.test(newPassword)) {
        err = true
        setError('new-password', {
          message:
            'Password must be at least 8 characters, 1 letter, 1 number and 1 special character',
        })
      }

      if (newPassword && oldPassword === newPassword) {
        err = true
        setError('new-password', {
          message: 'New password must be different from the old password',
        })
      }

      if (!confirmPassword) {
        err = true
        setError('confirm-password', {
          message: 'Confirm password is required',
        })
      }

      if (newPassword && confirmPassword && confirmPassword !== newPassword) {
        err = true
        setError('confirm-password', {
          message: 'Passwords do not match',
        })
      }

      if (!err) {
        mutateAsync({ oldPassword, newPassword, token })
      }
    }),
    [],
  )

  return (
    <Layout requireLogin={true}>
      <div className="min-h-screen grid w-full place-content-center">
        <form
          noValidate
          onSubmit={submit}
          className="min-h-[300px] p-4 border-b-2 grid place-content-center"
        >
          <AnimatePresence exitBeforeEnter>
            <motion.div
              initial="right"
              animate="center"
              exit="left"
              variants={variants}
              transition={{ duration: 0.35 }}
              className="grid place-content-center"
            >
              <h1 className="mb-8 text-2xl font-medium text-center text-blue-600">
                Change Password
              </h1>

              <div className="mb-4">
                <label htmlFor="old-password" className="crm-label">
                  Old Password
                </label>
                <Input
                  error={errors['old-password']?.message}
                  props={{
                    type: 'password',
                    className: 'w-full',
                    ...register('old-password'),
                  }}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="new-password" className="crm-label">
                  New Password
                </label>
                <Input
                  error={errors['new-password']?.message}
                  props={{
                    type: 'password',
                    className: 'w-full',
                    ...register('new-password'),
                  }}
                />
              </div>

              <div className="mb-4 min-w-[450px]">
                <label htmlFor="confirm-password" className="crm-label">
                  Confirm Password
                </label>
                <Input
                  error={errors['confirm-password']?.message}
                  props={{
                    type: 'password',
                    className: 'w-full',
                    ...register('confirm-password'),
                  }}
                />
              </div>

              <div className="mb-8">
                <button disabled={isLoading} className="crm-button w-full">
                  <Loading on={isLoading}>Submit</Loading>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </form>
      </div>
    </Layout>
  )
}

export function getServerSideProps(ctx: GetServerSidePropsContext) {
  const token = getSessionToken(ctx.req.cookies) || null
  return {
    props: {
      token,
    },
  }
}
