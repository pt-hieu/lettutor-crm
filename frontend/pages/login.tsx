import { notification } from 'antd'
import { signIn } from 'next-auth/client'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import Loading from '@utils/components/Loading'
import Input from '@utils/components/Input'

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
    [query],
  )

  return (
    <div className="min-h-screen grid w-full place-content-center">
      <form onSubmit={login} className="min-w-[350px]">
        <div className="mb-4">
          <label htmlFor="email" className="crm-label">
            Email
          </label>
          <Input
            error={errors.email?.message}
            props={{
              type: 'text',
              className: 'w-full',
              ...register('email', {
                required: {
                  value: true,
                  message: 'Email is required',
                },
              }),
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="crm-label">
            Password
          </label>
          <Input
            error={errors.password?.message}
            props={{
              type: 'password',
              autoComplete: 'currentpassword',
              className: 'w-full',
              ...register('password', {
                required: {
                  value: true,
                  message: 'Password is required',
                },
              }),
            }}
          />
        </div>

        <div className="mt-2">
          <button disabled={isLoggingIn} className="crm-button w-full">
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
