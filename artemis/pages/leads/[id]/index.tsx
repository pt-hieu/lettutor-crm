import Layout from '@utils/components/Layout'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import { getSessionToken } from '@utils/libs/getToken'
import { GetServerSideProps } from 'next'
import { getLead } from '@utils/service/lead'
import { useRouter } from 'next/router'
import LeadDetailSidebar from 'components/Leads/LeadDetailSidebar'
import LeadDetailNavbar from 'components/Leads/LeadDetailNavbar'
import { ReactNode, useMemo } from 'react'
import { Lead } from '@utils/models/lead'
import { investigate } from '@utils/libs/investigate'

type LeadInfo = {
  label: string
  value: ReactNode
}

const LeadDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  const { data: lead } = useQuery<Lead>(['lead', id], {
    enabled: false,
  })

  const leadInfo = useMemo(
    (): LeadInfo[] => [
      {
        label: 'Lead Owner',
        value: lead?.owner?.name,
      },
      {
        label: 'Full Name',
        value: lead?.fullName,
      },
      {
        label: 'Email',
        value: lead?.email,
      },
      {
        label: 'Phone',
        value: lead?.phoneNum,
      },
      {
        label: 'Lead Status',
        value: lead?.status,
      },
      {
        label: 'Lead Source',
        value: lead?.source,
      },
      {
        label: 'Address',
        value: lead?.address,
      },
      {
        label: 'Description',
        value: lead?.description,
      },
    ],
    [lead],
  )

  return (
    <Layout title={`CRM | Lead | ${lead?.fullName}`} requireLogin>
      <div className="crm-container">
        <LeadDetailNavbar lead={lead} />

        <div className="grid grid-cols-[250px,1fr]">
          <LeadDetailSidebar />

          <div>
            <div className="font-semibold mb-4 text-[17px]">Overview</div>
            <ul className="flex flex-col gap-4">
              {leadInfo.map(({ label, value }) => (
                <li key={label} className="grid grid-cols-[250px,1fr] gap-4">
                  <span className="inline-block text-right font-medium">
                    {label}
                  </span>
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)
  const id = params?.id as string

  if (token) {
    await Promise.all([
      client.prefetchQuery(['lead', id], getLead(id, token)),
    ])
  }

  return {
    notFound: investigate(client, ['lead', id]).isError,
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default LeadDetail
