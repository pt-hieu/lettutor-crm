import { ReactNode } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import Header from './Header'
import { useSession } from 'next-auth/client'

const RequireLogin = dynamic(() => import('./RequireLogin'), { ssr: false })

type Props = {
  title?: string
  children: ReactNode
} & (
  | { requireLogin: true; header?: boolean }
  | { requireLogin?: false; header: false }
)

function Layout({ children, title, requireLogin, header }: Props) {
  const [session] = useSession()
  return (
    <>
      <Head>
        <title>{title || 'CRM System'}</title>
      </Head>

      {requireLogin && <RequireLogin />}
      {(session || !requireLogin) && (
        <>
          {header && <Header />}
          <main>{children}</main>{' '}
        </>
      )}
    </>
  )
}

Layout.defaultProps = {
  header: true,
}

export default Layout
