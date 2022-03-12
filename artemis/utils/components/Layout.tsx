import { API } from 'environment'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { ReactNode, useEffect } from 'react'
import { useQueryClient } from 'react-query'
import { useKey } from 'react-use'

import { GlobalState } from '@utils/GlobalStateKey'
import { useModal } from '@utils/hooks/useModal'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { Actions } from '@utils/models/role'

import BugReporter from './BugReporter'
import Footer from './Footer'
import Header from './Header'
import { OG } from './OpenGraph'
import Search from './Search'
import SessionInvalidate from './SessionInvalidate'

const RequireLogin = dynamic(() => import('./RequireLogin'), { ssr: false })

type Props = {
  title?: string
  description?: string
  keywords?: string
  children: ReactNode
  footer?: boolean
  og?: Partial<OG>
  disableSearch?: boolean
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
  disableSearch,
}: Props) {
  const [session] = useTypedSession()
  const client = useQueryClient()

  const [search, openSearch, closeSearch] = useModal()
  useKey(
    '/',
    (event) => {
      if (disableSearch) return
      if (!event.ctrlKey) return

      openSearch()
    },
    { event: 'keydown' },
    [disableSearch],
  )

  useEffect(() => {
    const auth = Object.values(Actions)
      .map((scope) => Object.values(scope))
      .flat()
      .reduce(
        (sum, curr) => ({
          ...sum,
          [curr]: session?.user.roles.some(
            (role) =>
              role.actions.includes(curr) ||
              role.actions.includes(Actions.Admin.IS_ADMIN),
          ),
        }),
        {},
      )

    client.setQueryData(GlobalState.AUTHORIZATION, auth)
  }, [session])

  useEffect(() => {
    if (!session) return

    const eventSource = new EventSource(API + '/subscribe', {
      withCredentials: true,
    })

    if (!eventSource) return
    eventSource.onmessage = ({ data }: MessageEvent) => {
      console.log({ data })

      client.setQueryData(GlobalState.SUBSCRIPTION, JSON.parse(data))
    }

    return () => {
      eventSource.close()
    }
  }, [session])

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

      <SessionInvalidate />
      {!disableSearch && <Search close={closeSearch} visible={search} />}

      {process.env.NODE_ENV === 'production' && <BugReporter />}
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
