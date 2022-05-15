import { ARTEMIS_URL } from 'environment'
import Head from 'next/head'
import { useQuery } from 'react-query'

import { GlobalState } from '@utils/GlobalStateKey'

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
      image: '/og_image.png',
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
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="5692" />
      <meta property="og:image:height" content="3200" />
      <meta property="og:image:alt" content="Artemis CRM" />

      <meta property="og:locale" content={data?.locale} />
      <meta property="og:type" content={data?.type} />
      <meta property="og:url" content={data?.url} />
      <meta property="og:description" content={data?.description} />
    </Head>
  )
}
