import { ReactNode, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import Header from './Header'
import { useSession } from 'next-auth/client'
import Footer from './Footer'
import { OG } from './OpenGraph'
import { useQueryClient } from 'react-query'
import { GlobalState } from '@utils/GlobalStateKey'
import BugReporter from './BugReporter'
import PoseidonAuth from './PoseidonAuth'
import { Actions } from '@utils/models/role'
import { useTypedSession } from '@utils/hooks/useTypedSession'

const RequireLogin = dynamic(() => import('./RequireLogin'), { ssr: false })

type Props = {
  title?: string
  description?: string
  keywords?: string
  children: ReactNode
  footer?: boolean
  og?: Partial<OG>
} & (
  | { requireLogin: true; header?: boolean }
  | { requireLogin?: false; header: false }
)

function Layout({
  children,
  title,
  requireLogin,
  header,
  footer,
  og,
  description,
  keywords,
}: Props) {
  const [session] = useTypedSession()
  const client = useQueryClient()

  useEffect(() => {
    const autho = Object.values(Actions).reduce(
      (sum, curr) => ({
        ...sum,
        [curr]: session?.user.roles.some(
          (role) =>
            role.actions.includes(curr) ||
            role.actions.includes(Actions.IS_ADMIN),
        ),
      }),
      {},
    )

    client.setQueryData(GlobalState.AUTHORIZATION, autho)
  }, [])

  useEffect(() => {
    if (!og) return

    const data = client.getQueryData<OG>(GlobalState.OPEN_GRAPH) || {}
    client.setQueryData(GlobalState.OPEN_GRAPH, { ...data, ...og })
  }, [])

  return (
    <>
      <Head>
        <title>{title || 'Artemis CRM'}</title>
        <meta
          name="description"
          content={description || 'Artemis CRM &copy; 2021'}
        />
        <meta
          name="keywords"
          content={
            keywords ||
            'customer, crm, customer relation management, web application, sales, marketing'
          }
        />
      </Head>

      {process.env.NODE_ENV === 'production' && (
        <>
          <BugReporter />
          <PoseidonAuth />
        </>
      )}

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
