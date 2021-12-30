import { ReactNode, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import Header from './Header'
import { useSession } from 'next-auth/client'
import Footer from './Footer'
import { OG } from './OpenGraph'
import { useQueryClient } from 'react-query'
import { GlobalState } from '@utils/GlobalStateKey'

const RequireLogin = dynamic(() => import('./RequireLogin'), { ssr: false })

type Props = {
  title?: string
  children: ReactNode
  footer?: boolean
  og?: Partial<OG>
} & (
  | { requireLogin: true; header?: boolean }
  | { requireLogin?: false; header: false }
)

function Layout({ children, title, requireLogin, header, footer, og }: Props) {
  const [session] = useSession()
  const client = useQueryClient()

  useEffect(() => {
    if (!og) return

    const data = client.getQueryData<OG>(GlobalState.OPEN_GRAPH) || {}
    client.setQueryData(GlobalState.OPEN_GRAPH, { ...data, ...og })
  }, [])

  return (
    <>
      <Head>
        <title>{title || 'Artemis CRM'}</title>
      </Head>

      {requireLogin && <RequireLogin />}
      {(session || !requireLogin) && (
        <>
          {header && <Header key="header" />}
          <main className="min-h-[calc(100vh-140px)]">{children}</main>
          {footer && <Footer />}
        </>
      )}
    </>
  )
}

Layout.defaultProps = {
  header: true,
  footer: true,
}

export default Layout
