import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'
import { changePassword, updatePassword } from '@utils/service/user'
import { notification } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'

interface FormData {
  'current-password': string
  'new-password': string
  'confirm-password': string
}

enum State {
  INPUT_PASSWORD = 'Change password',
  INPUT_PASSWORD_SUCCESS = '2',
}

const variants = {
  right: {
    opacity: 0,
    transform: 'translateX(14px)',
  },
  center: {
    opacity: 1,
    transform: 'translateX(0px)',
  },
  left: {
    opacity: 0,
    transform: 'translateX(-14px)',
  },
}

const passwordReg =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

export default function ChangePassword() {
  const { query } = useRouter()
  const [state, setState] = useState<State>(State.INPUT_PASSWORD)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>()

  const { mutateAsync, isLoading, error } = useMutation(
    'change-password',
    changePassword,
    {
      onSuccess() {
        // setState(State.INPUT_PASSWORD_SUCCESS)
        console.log('Success')
      },
      onError() {
        console.log(error)
        notification.error({
          message: state + ' unsuccessfully',
        })
      },
    },
  )

  const submit = useCallback(
    handleSubmit(async (data) => {
      let err = false

      const oldPassword = data['current-password']
      const newPassword = data['new-password']
      const confirmPassword = data['confirm-password']

      if (!oldPassword) {
        err = true
        setError('current-password', {
          message: 'Password is required',
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
        //@ts-ignore
        await mutateAsync({ oldPassword, newPassword, confirmPassword })
      }
    }),
    [state, query],
  )

  useEffect(() => {
    console.log(errors)
  }, [errors])

  const renderByState: Record<State, JSX.Element> = useMemo(
    () => ({
      [State.INPUT_PASSWORD]: (
        <>
          <h1 className="mb-8 text-2xl font-medium text-center text-blue-600">
            Change Password
          </h1>

          <div className="mb-4">
            <label htmlFor="current-password" className="crm-label">
              Current Password
            </label>
            <input
              type="password"
              id="current-password"
              autoFocus
              className={`crm-input w-full ${
                errors['current-password'] ? 'crm-input--error' : ''
              }`}
              {...register('current-password')}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="new-password" className="crm-label">
              New Password
            </label>
            <input
              type="password"
              id="new-password"
              className={`crm-input w-full ${
                errors['new-password'] ? 'crm-input--error' : ''
              }`}
              {...register('new-password')}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirm-password" className="crm-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              className={`crm-input w-full ${
                errors['confirm-password'] ? 'crm-input--error' : ''
              }`}
              {...register('confirm-password')}
            />
          </div>

          <div className="mb-8">
            <button disabled={isLoading} className="crm-button w-full">
              <Loading on={isLoading}>Submit</Loading>
            </button>
          </div>
        </>
      ),
      [State.INPUT_PASSWORD_SUCCESS]: (
        <>
          <div className="text-center font-medium">
            Your password has been changed successfully
          </div>
          <Link href="/login">
            <a className="text-center mt-2">Back to Login</a>
          </Link>
        </>
      ),
    }),
    [
      errors['current-password'],
      errors['new-password'],
      errors['confirm-password'],
      isLoading,
    ],
  )

  return (
    <Layout header={true} requireLogin={true}>
      <div className="min-h-screen grid w-full place-content-center">
        <form
          noValidate
          onSubmit={submit}
          className="w-[450px] min-h-[300px] p-4 border-b-2 grid place-content-center"
        >
          <AnimatePresence exitBeforeEnter>
            <motion.div
              initial="right"
              animate="center"
              exit="left"
              variants={variants}
              key={state}
              transition={{ duration: 0.35 }}
              className="grid place-content-center"
            >
              {renderByState[state]}
            </motion.div>
          </AnimatePresence>
        </form>
      </div>
    </Layout>
  )
}
