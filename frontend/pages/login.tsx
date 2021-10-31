import { signIn } from 'next-auth/client'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
}

export default function Login() {
  const { query } = useRouter()
  const { register, handleSubmit } = useForm<FormData>()

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
          <button type="submit" className="cr-button">
            Login
          </button>
        </div>
      </form>
    </div>
  )
}
