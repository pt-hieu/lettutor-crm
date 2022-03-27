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
import CustomizationHeader from './CustomizationHeader'
import Footer from './Footer'
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
          {header && (
            <header className="z-[1000] crm-container sticky top-0 flex justify-between items-center h-[60px] shadow-md bg-white">
              <div className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span className="font-semibold text-xl !text-blue-600 crm-link">
                  Leads
                </span>
              </div>

              <div className="flex gap-3 items-center relative z-20">
                <button className="crm-button-secondary">Cancel</button>
                <button className="crm-button-secondary">Save & Close</button>
                <button className="crm-button">Save</button>
              </div>
            </header>
          )}
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
