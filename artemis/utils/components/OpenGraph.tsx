import { GlobalState } from '@utils/GlobalStateKey'
import { ARTEMIS_URL } from 'environment'
import Head from 'next/head'
import { useQuery } from 'react-query'

export type OG = {
  title: string
  url: string
  image: string
  type: string
  description: string
  locale: string
}

export default function OpenGraph() {
  const { data } = useQuery<OG>(GlobalState.OPEN_GRAPH, {
    enabled: false,
    initialData: {
      description: 'A CRM system for sales & marketing',
      image: '', // TBD
      locale: 'en_US',
      title: 'Artemis CRM',
      type: 'website',
      url: ARTEMIS_URL || 'http://localhost:3000',
    },
  })

  return (
    <Head>
      <meta property="og:title" content={data?.title} />
      <meta property="og:image" content={data?.image} />
      <meta property="og:locale" content={data?.locale} />
      <meta property="og:type" content={data?.type} />
      <meta property="og:url" content={data?.url} />
      <meta property="og:description" content={data?.description} />
    </Head>
  )
}
