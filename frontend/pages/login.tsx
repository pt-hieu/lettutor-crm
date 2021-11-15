import { notification } from 'antd'
import { signIn } from 'next-auth/client'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

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
  const { register, handleSubmit } = useForm<FormData>()

  useEffect(() => {
    if (!('error' in query)) return
    notification.error({
      message: errorMapping[query.error as string],
    })
  }, [query])

  const login = useCallback(
    handleSubmit((data) => {
      signIn('login', {
        callbackUrl: (query.callbackUrl as string) || '/',
        ...data,
      })
    }),
    [],
  )

  return (
    <div className="min-h-screen grid w-full place-content-center">
      <form onSubmit={login} noValidate>
        <div className="mb-4">
          <label htmlFor="email" className="crm-label">
            Email
          </label>
          <input
            type="text"
            id="email"
            className="crm-input w-full"
            {...register('email')}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="pwd" className="crm-label">
            Password
          </label>
          <input
            type="password"
            autoComplete="currentpassword"
            id="pwd"
            className="crm-input w-full"
            {...register('password')}
          />
        </div>

        <div className="mt-2">
          <button type="submit" className="crm-button">
            Login
          </button>
          <Link href="/login">
            <a className="ml-2">Forgor password</a>
          </Link>
        </div>
      </form>
    </div>
  )
}
