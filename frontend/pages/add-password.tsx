import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'
import { asyncTryCatch } from '@utils/libs/functionalTryCatch'
import { updatePassword } from '@utils/service/user'
import { notification } from 'antd'
import axios from 'axios'
import { API } from 'environment'
import { AnimatePresence, motion } from 'framer-motion'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { requireRule } from './change-password'
import { passwordReg } from './reset-password'

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
      props: { isValidToken: !error },
    }
  }

  return {
    props: {},
  }
}

interface FormData {
  password: string
  confirmPassword: string
}

enum State {
  INVALID_TOKEN = '3',
  INPUT_PASSWORD = 'Reset password',
  INPUT_PASSWORD_SUCCESS = '2',
}

const serviceByState = {
  [State.INPUT_PASSWORD]: updatePassword,
  [State.INVALID_TOKEN]: () => Promise.reject(undefined),
  [State.INPUT_PASSWORD_SUCCESS]: () => Promise.reject(undefined),
}

const validatePassword = (
  data: FormData,
): { key: keyof FormData; message: string } | null => {
  const { password, confirmPassword } = data

  if (password && !passwordReg.test(password)) {
    return {
      key: 'password',
      message:
        'Password must be at least 8 characters, 1 letter, 1 number and 1 special character',
    }
  }

  if (confirmPassword !== password) {
    return {
      key: 'confirmPassword',
      message: 'Passwords do not match',
    }
  }

  return null
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

export default function ResetPassword({ isValidToken }: Props) {
  const { query } = useRouter()
  const [state, setState] = useState<State>(() => {
    if (!isValidToken) return State.INVALID_TOKEN
    return State.INPUT_PASSWORD
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>()

  const { mutateAsync, isLoading } = useMutation(
    ['add-password', state],
    //@ts-ignore
    serviceByState[state],
    {
      onSuccess() {
        if (state === State.INPUT_PASSWORD) {
          setState(State.INPUT_PASSWORD_SUCCESS)
        }
      },
      onError() {
        notification.error({
          message: 'Add password unsuccessfully',
        })
      },
    },
  )

  const submit = useCallback(
    handleSubmit((data) => {
      const err = validatePassword(data)
      if (err) {
        return setError(err.key, {
          message: err.message,
        })
      }
      //@ts-ignore
      mutateAsync({ ...data, token: query.token })
    }),
    [state, query],
  )

  const renderByState: Record<State, JSX.Element> = useMemo(
    () => ({
      [State.INPUT_PASSWORD]: (
        <>
          <h1 className="mb-8 text-2xl font-medium text-center text-blue-600">
            Add password
          </h1>

          <div className="mb-4">
            <label htmlFor="password" className="crm-label">
              Password
            </label>
            <Input
              error={errors.password?.message}
              props={{
                type: 'password',
                autoFocus: true,
                className: 'w-full',
                ...register('password', requireRule('Password')),
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="crm-label">
              Confirm Password
            </label>
            <Input
              error={errors['confirmPassword']?.message}
              props={{
                type: 'password',
                className: 'w-full',
                ...register('confirmPassword', requireRule('Confirm password')),
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
            Your password has been added successfully
          </div>
          <Link href="/login">
            <a className="text-center mt-2">Back to Login</a>
          </Link>
        </>
      ),
    }),
    [errors.password, errors.confirmPassword, isLoading],
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
