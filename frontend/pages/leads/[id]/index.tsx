import Layout from '@utils/components/Layout'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import { getSessionToken } from '@utils/libs/getToken'
import { GetServerSideProps } from 'next'
import { getLead } from '@utils/service/lead'
import { useRouter } from 'next/router'
import LeadDetailSidebar from 'components/Leads/LeadDetailSidebar'
import LeadDetailNavbar from 'components/Leads/LeadDetailNavbar'
import { LeadSource, LeadStatus } from '@utils/models/lead'

const emptyValueIcon = '---'

const LeadDetail = () => {
  const router = useRouter()
  const id = router.query.id as string
  const { data: lead, isLoading } = useQuery(['lead', id], getLead(id))

  const leadInfo = [
    {
      label: 'Lead Owner',
      value: lead?.owner.name,
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
      value: lead?.status === LeadStatus.NONE ? undefined : lead?.status,
    },
    {
      label: 'Lead Source',
      value: lead?.source === LeadSource.NONE ? undefined : lead?.source,
    },
    {
      label: 'Address',
      value: lead?.address,
    },
    {
      label: 'Description',
      value: lead?.description,
    },
  ]

  return (
    <Layout title={`CRM | Lead Detail`} requireLogin>
      <div>
        <LeadDetailNavbar isLoading={isLoading} lead={lead} />

        <div className="grid grid-cols-[300px,1fr] h-[calc(100vh-60px-80px)]">
          <LeadDetailSidebar />
          <div className="crm-container border bg-gray-100 pl-5">
            <div className="bg-white rounded-md p-5 drop-shadow">
              <ul>
                {leadInfo.map(({ label, value }) => (
                  <li key={label}>
                    <span className="inline-block p-2 w-[150px] text-right font-semibold">
                      {label}
                    </span>
                    <span className="inline-block p-2">
                      {value || emptyValueIcon}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
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
    await Promise.all([client.prefetchQuery(['lead', id], getLead(id, token))])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default LeadDetail
