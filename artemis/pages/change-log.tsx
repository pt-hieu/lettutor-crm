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

  return (
    <Layout title="Artemis | Change Log">
      <div className="crm-container">
        <div className="text-xl font-medium">Artemis Change Log</div>
        <Divider />

        <div className="flex flex-col gap-6">
          {changeLogs?.data.map(
            ({ id, attributes: { version, releasedAt, changes } }) => (
              <div key={id + 'changelog'}>
                <div className="inline-block border border-b-0 p-3 pb-1 border-blue-400">
                  <span className="font-medium">{version}</span> -{' '}
                  {moment(releasedAt).format('MMMM DD, YYYY')}
                </div>
                <div className="border rounded-lg rounded-tl-none p-4 bg-blue-400 text-white grid grid-cols-[1fr,60px]">
                  <ReactMarkdown>{changes}</ReactMarkdown>
                  <div className="flex justify-center items-start">
                    <button>
                      <span className="fa fa-angle-right" />
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </Layout>
  )
}
