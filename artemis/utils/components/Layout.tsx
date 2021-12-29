import { ReactNode } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import Header from './Header'
import { useSession } from 'next-auth/client'
import Footer from './Footer'

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
        <title>{title || 'Artemis CRM'}</title>
      </Head>

      {requireLogin && <RequireLogin />}
      {(session || !requireLogin) && (
        <>
          {header && <Header key="header" />}
          <main className='min-h-[calc(100vh-140px)]'>{children}</main>
          <Footer />
        </>
      )}
    </>
  )
}

Layout.defaultProps = {
  header: true,
}

export default Layout
