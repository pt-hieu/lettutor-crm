import { AppProps } from 'next/app'
import { Provider as NextAuthProvider } from 'next-auth/client'
import '../styles/tailwind.css'
import 'antd/dist/antd.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Hydrate } from 'react-query/hydration'
import { useState } from 'react'
import axios from 'axios'

axios.defaults.withCredentials = true

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
          <Component {...pageProps} />
        </Hydrate>
      </QueryClientProvider>
    </NextAuthProvider>
  )
}

export default MyApp
