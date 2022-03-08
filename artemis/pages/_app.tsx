import { notification } from 'antd'
import 'antd/dist/antd.css'
import axios from 'axios'
import { Provider as NextAuthProvider } from 'next-auth/client'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Hydrate } from 'react-query/hydration'

import OpenGraph from '@utils/components/OpenGraph'

import '../styles/global.scss'
import '../styles/markdown.css'
import '../styles/tailwind.css'

axios.defaults.withCredentials = true

notification.config({
  placement: 'bottomRight',
})

const NoOverlay = `
  window.addEventListener('error', event => {
    event.stopImmediatePropagation()
  })

  window.addEventListener('unhandledrejection', event => {
    event.stopImmediatePropagation()
  })
`

function MyApp({ Component, pageProps }: AppProps) {
  const [client] = useState(() => new QueryClient())

  return (
    <NextAuthProvider
      options={{
        clientMaxAge: 0,
        keepAlive: 0,
      }}
      session={pageProps.session}
    >
      <QueryClientProvider client={client}>
        <Hydrate state={pageProps?.dehydratedState}>
          {/* <Head>
            {process.env.NODE_ENV !== 'production' && (
              <script dangerouslySetInnerHTML={{ __html: NoOverlay }} />
            )}
          </Head> */}
          <Component {...pageProps} />
          <OpenGraph />
        </Hydrate>
      </QueryClientProvider>
    </NextAuthProvider>
  )
}

export default MyApp
