import { notification } from 'antd'
import { signIn } from 'next-auth/client'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import Loading from '@utils/components/Loading'

type FormData = {
  email: string
  password: string
}

const errorMapping: Record<string, string> = {
  AccessDenied: 'Your account has not existed in the system yet!',
  CredentialsSignin: 'Your provided credentials are not correct!',
  Callback: 'System failure!',
}

export default function Login() {
  const { query } = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (!('error' in query)) return
    notification.error({
      message: errorMapping[query.error as string],
    })
  }, [query])

  const login = useCallback(
    handleSubmit((data) => {
      setIsLoggingIn(true)
      signIn('login', {
        callbackUrl: (query.callbackUrl as string) || '/',
        ...data,
      })
    }),
    [],
  )

  return (
    <div className="min-h-screen grid w-full place-content-center">
      <form onSubmit={login} noValidate className="min-w-[350px]">
        <div className="mb-4">
          <label htmlFor="email" className="crm-label">
            Email
          </label>
          <input
            type="text"
            id="email"
            className={`crm-input w-full ${
              errors.email ? 'crm-input--error' : ''
            }`}
            {...register('email', {
              required: {
                value: true,
                message: 'Email is required',
              },
            })}
          />
          {errors.email && (
            <div className="mt-2 text-red-600">{errors.email.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="pwd" className="crm-label">
            Password
          </label>
          <input
            type="password"
            autoComplete="currentpassword"
            id="pwd"
            className={`crm-input w-full ${
              errors.email ? 'crm-input--error' : ''
            }`}
            {...register('password', {
              required: {
                value: true,
                message: 'Password is required',
              },
            })}
          />
          {errors.password && (
            <div className="mt-2 text-red-600">{errors.password.message}</div>
          )}
        </div>

        <div className="mt-2">
          <button type="submit" className="crm-button w-full">
            <Loading on={isLoggingIn}>Login</Loading>
          </button>
          <Link href="/reset-password">
            <a className="mt-2 inline-block w-full text-right">
              Forgot password
            </a>
          </Link>
        </div>
      </form>
    </div>
  )
}
