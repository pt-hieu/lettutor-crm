import Layout from '@utils/components/Layout'
import { asyncTryCatch } from '@utils/libs/functionalTryCatch'
import axios from 'axios'
import { GetServerSideProps } from 'next'
import { API } from 'environment'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { requestResetEmail, updatePassword } from '@utils/service/user'
import { notification } from 'antd'
import Link from 'next/link'
import Loading from '@utils/components/Loading'
import Input from '@utils/components/Input'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  isValidToken?: boolean
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
}) => {
  const token = query.token as string | undefined

  if (token) {
    const [_, error] = await asyncTryCatch(() =>
      axios
        .get(API + '/api/user/validate-token', { params: { token } })
        .then((res) => res.data),
    )

    return {
      props: { isValidToken: !!error },
    }
  }

  return {
    props: {},
  }
}

interface FormData {
  email: string
  password: string
  'confirm-password': string
}

enum State {
  INPUT_EMAIL = 'Send email',
  INPUT_EMAIL_SUCCESS = '1',
  INVALID_TOKEN = '3',
  INPUT_PASSWORD = 'Reset password',
  INPUT_PASSWORD_SUCCESS = '2',
}

const serviceByState = {
  [State.INPUT_EMAIL]: requestResetEmail,
  [State.INPUT_PASSWORD]: updatePassword,
  [State.INPUT_EMAIL_SUCCESS]: () => Promise.reject(undefined),
  [State.INVALID_TOKEN]: () => Promise.reject(undefined),
  [State.INPUT_PASSWORD_SUCCESS]: () => Promise.reject(undefined),
}

export const variants = {
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

const emailReg =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const passwordReg =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

export default function ResetPassword({ isValidToken }: Props) {
  const { query } = useRouter()
  const [state, setState] = useState<State>(() => {
    if (isValidToken) return State.INVALID_TOKEN
    if (query.token) return State.INPUT_PASSWORD
    return State.INPUT_EMAIL
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>()

  const { mutateAsync, isLoading } = useMutation(
    ['reset-password', state],
    //@ts-ignore
    serviceByState[state],
    {
      onSuccess() {
        if (state === State.INPUT_EMAIL) {
          setState(State.INPUT_EMAIL_SUCCESS)
        }

        if (state === State.INPUT_PASSWORD) {
          setState(State.INPUT_PASSWORD_SUCCESS)
        }
      },
      onError() {
        notification.error({
          message: state + ' unsuccessfully',
        })
      },
    },
  )

  const submit = useCallback(
    handleSubmit((data) => {
      let err = false
      if (state === State.INPUT_EMAIL) {
        const email = data.email

        if (!email) {
          err = true
          setError('email', {
            message: 'Email is required',
          })
        }

        if (email && !emailReg.test(email)) {
          err = true
          setError('email', {
            message: 'Please enter a valid email address',
          })
        }
      }

      if (state === State.INPUT_PASSWORD) {
        const password = data.password
        const confirmPassword = data['confirm-password']

        if (!password) {
          err = true
          setError('password', {
            message: 'Password is required',
          })
        }

        if (password && !passwordReg.test(password)) {
          err = true
          setError('password', {
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

        if (password && confirmPassword && confirmPassword !== password) {
          err = true
          setError('confirm-password', {
            message: 'Passwords do not match',
          })
        }
      }

      if (!err) {
        //@ts-ignore
        mutateAsync({ ...data, token: query.token })
      }
    }),
    [state, query],
  )

  useEffect(() => {
    console.log(errors)
  }, [errors])

  const renderByState: Record<State, JSX.Element> = useMemo(
    () => ({
      [State.INPUT_EMAIL]: (
        <>
          <h1 className="mb-0 text-2xl font-medium text-center text-blue-600">
            Forgot Password
          </h1>
          <div className="mb-6 text-center">Enter your email address</div>

          <div className="mb-4">
            <Input
              error={errors.email?.message}
              props={{
                type: 'email',
                autoFocus: true,
                placeholder: 'Enter email address',
                className: 'w-full',
                ...register('email'),
              }}
            />
          </div>

          <div>
            <button disabled={isLoading} className="crm-button w-full">
              <Loading on={isLoading}>Submit</Loading>
            </button>
          </div>
        </>
      ),
      [State.INPUT_EMAIL_SUCCESS]: (
        <>
          <div className="text-center font-medium">
            An email was sent to your email address containing a link to reset
            your password
          </div>
          <Link href="/login">
            <a className="text-center mt-2">Back to Login</a>
          </Link>
        </>
      ),
      [State.INPUT_PASSWORD]: (
        <>
          <h1 className="mb-8 text-2xl font-medium text-center text-blue-600">
            Forgot Password
          </h1>

          <div className="mb-4">
            <label htmlFor="password" className="crm-label">
              New Password
            </label>
            <Input
              error={errors.password?.message}
              props={{
                type: 'password',
                autoFocus: true,
                className: 'w-full',
                ...register('password'),
              }}
            />
          </div>

          <div className="mb-4">
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
        </>
      ),
      [State.INVALID_TOKEN]: (
        <>
          <div className="text-center font-medium">
            This link is no longer available
          </div>
          <div className="text-center mt-2 text-gray-500">
            If you think this is not your fault, please contact the
            administrators
          </div>
          <Link href="/login">
            <a className="text-center mt-2">Back to Login</a>
          </Link>
        </>
      ),
      [State.INPUT_PASSWORD_SUCCESS]: (
        <>
          <div className="text-center font-medium">
            Your password has been reset successfully
          </div>
          <Link href="/login">
            <a className="text-center mt-2">Back to Login</a>
          </Link>
        </>
      ),
    }),
    [errors.email, errors.password, errors['confirm-password'], isLoading],
  )

  return (
    <Layout header={false}>
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
