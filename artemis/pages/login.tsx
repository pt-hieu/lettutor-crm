import Layout from '@utils/components/Layout'
import { signIn } from 'next-auth/client'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import Loading from '@utils/components/Loading'
import Input from '@utils/components/Input'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { GetServerSideProps } from 'next'

type FormData = {
  email: string
  password: string
}

const errorMapping: Record<string, string> = {
  AccessDenied: 'Your account has not existed in the system yet!',
  CredentialsSignin: 'Your provided credentials are not correct!',
  Callback: 'System failure!',
}

const schema = yup.object().shape({
  email: yup
    .string()
    .typeError('Email has to be a string')
    .email('Invalid email')
    .required('Email is required'),
  password: yup
    .string()
    .typeError('Password has to be a string')
    .required('Password is required'),
})

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  }
}

export default function Login() {
  const { query } = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const [authError, setAuthError] = useState<string>()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (!('error' in query)) return
    if (query.error === 'undefined') return

    setAuthError(errorMapping[query.error as string])
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
    <Layout footer={false} header={false} title="Login to Artemis">
      <div className="min-h-screen grid w-full place-content-center">
        <div className="grid grid-cols-[3fr,2fr] max-w-[1200px] border p-8 rounded-lg overflow-hidden shadow-sm">
          <div className="grid place-content-center bg-blue-600 -my-8 -ml-8 md:hidden">
            <img
            // src="/illus/login_bg.svg"
            // className="block w-1/2 m-auto"
            // alt="login_background"
            />
          </div>

          <form
            onSubmit={login}
            className="min-w-[450px] px-8 pl-16 py-16 mx-auto"
          >
            <div className="mb-8 text-center font-semibold">
              <div className="text-blue-600 text-3xl">Login</div>
            </div>

            {authError && (
              <div className="mb-8 text-center text-red-600 px-3 py-2 rounded-md border border-red-600">
                <button
                  onClick={() => setAuthError(undefined)}
                  className="fa fa-times mr-2"
                ></button>
                {authError}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="crm-label">
                Email
              </label>
              <Input
                error={errors.email?.message}
                props={{
                  id: 'email',
                  type: 'text',
                  className: 'w-full',
                  ...register('email'),
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
                  id: 'password',
                  type: 'password',
                  autoComplete: 'currentpassword',
                  className: 'w-full',
                  ...register('password'),
                }}
              />
            </div>

            <Link href="/reset-password">
              <a className="inline-block w-full text-right">Forgot password</a>
            </Link>

            <div className="mt-4">
              <button disabled={isLoggingIn} className="crm-button w-full">
                <Loading on={isLoggingIn}>
                  <span className="fa-solid fa-right-to-bracket mr-2" />
                  Login
                </Loading>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
