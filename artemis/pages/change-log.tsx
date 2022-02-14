import Layout from '@utils/components/Layout'
import { getChangeLog } from '@utils/service/changeLog'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import { GetServerSideProps } from 'next'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import root from 'react-shadow'
import { useEffect, useMemo } from 'react'
import { useQueryState } from '@utils/hooks/useQueryState'
import remarkGfm from 'remark-gfm'

export const getServerSideProps: GetServerSideProps = async () => {
  const client = new QueryClient()
  await client.prefetchQuery('change-logs', getChangeLog)

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default function ChangeLogs() {
  const { data: changeLogs } = useQuery('change-logs', getChangeLog, {
    enabled: false,
  })

  const [selectedVersion, setSelectedVesrion] = useQueryState<string>('version')

  const selectedChange = useMemo(
    () =>
      changeLogs?.items.find((log) => log.version === selectedVersion)?.changes,
    [changeLogs, selectedVersion],
  )

  useEffect(() => {
    setSelectedVesrion(changeLogs?.items[0].version)
  }, [])

  return (
    <Layout title="Artemis | Change Log">
      <div className="crm-container grid grid-cols-[200px,1fr] gap-4">
        <div className="flex flex-col gap-2 py-5 border-r pr-4">
          {changeLogs?.items.map(({ id, version, releasedAt }) => (
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
          ))}
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
