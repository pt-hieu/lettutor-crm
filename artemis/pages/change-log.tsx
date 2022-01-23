import Layout from '@utils/components/Layout'
import { strapiApiCall } from '@utils/libs/strapiApiCall'
import { Strapi } from '@utils/models/base'
import { ChangeLog } from '@utils/models/changeLog'
import { StrapiPaginate } from '@utils/models/paging'
import { getChangeLog } from '@utils/service/changeLog'
import { Divider } from 'antd'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import { GetServerSideProps } from 'next'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import root from 'react-shadow'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryState } from '@utils/hooks/useQueryState'
import remarkGfm from 'remark-gfm'

export const getServerSideProps: GetServerSideProps = async () => {
  const client = new QueryClient()

  await client.prefetchQuery(
    'change-logs',
    strapiApiCall<any, any>()(getChangeLog),
  )

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default function ChangeLogs() {
  const { data: changeLogs } = useQuery<StrapiPaginate<Strapi<ChangeLog>>>(
    'change-logs',
    {
      enabled: false,
    },
  )

  const [selectedVersion, setSelectedVesrion] = useQueryState<string>('version')

  const selectedChange = useMemo(
    () =>
      changeLogs?.data.find((log) => log.attributes.version === selectedVersion)
        ?.attributes.changes,
    [changeLogs, selectedVersion],
  )

  useEffect(() => {
    setSelectedVesrion(changeLogs?.data[0].attributes.version)
  }, [])

  return (
    <Layout title="Artemis | Change Log">
      <div className="crm-container grid grid-cols-[200px,1fr] gap-4">
        <div className="flex flex-col gap-2 py-5 border-r pr-4">
          {changeLogs?.data.map(
            ({ id, attributes: { version, releasedAt } }) => (
              <button
                onClick={() => setSelectedVesrion(version)}
                key={id + 'changelog'}
                className={`crm-button-outline text-left ${
                  selectedVersion === version
                    ? 'bg-blue-400 text-white border-white hover:text-white hover:border-white'
                    : ''
                }`}
              >
                <span className="font-medium">{version}</span> -{' '}
                {moment(releasedAt).format('MMMM DD')}
              </button>
            ),
          )}
        </div>

        <root.div className="bg-blue-400 text-white px-4 rounded-md">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {selectedChange || ''}
          </ReactMarkdown>
        </root.div>
      </div>
    </Layout>
  )
}
