import Layout from '@utils/components/Layout'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import { getSessionToken } from '@utils/libs/getToken'
import { GetServerSideProps } from 'next'
import { getLead } from '@utils/service/lead'
import { useRouter } from 'next/router'
import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import DealDetailNavbar from 'components/Deals/DealDetailNavbar'
import { ReactNode, useMemo } from 'react'

export type SampleDeal = {
  id: string
  owner: string
  name: string
  accountName: string
  amount: number
  closingDate: string
  stage: string
  leadSource: string
  contactName: string
  probability: number
  description: string
}

type LeadInfo = {
  label: string
  value: ReactNode
}

const dealSidebarOptions: SidebarStructure = [
  {
    title: 'Related List',
    options: [
      {
        label: 'Open Activities',
      },
      {
        label: 'Closed Activities',
      },
    ],
  },
  {
    title: 'Sales Summary',
    options: [
      {
        label: 'Lead Conversion Time: NA',
      },
    ],
  },
]

const DealDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  // Waiting backend api
  //const { data: lead } = useQuery<Lead>(['lead', id], {
  //enabled: false,
  //})

  const deal: SampleDeal = {
    id: '123',
    owner: 'Hoa Pham',
    name: 'Hoa Pham Deal',
    accountName: 'Hoa Pham Account',
    amount: 1000,
    closingDate: '08/12/2021',
    stage: 'Chứng thực',
    leadSource: 'Facebook',
    contactName: 'Hoa Pham Contact',
    probability: 10,
    description: 'description ne',
  }

  const dealInfo = useMemo(
    (): LeadInfo[] => [
      {
        label: 'Deal Owner',
        value: deal.owner,
      },
      {
        label: 'Deal Name',
        value: deal.name,
      },
      {
        label: 'Account Name',
        value: deal.accountName,
      },
      {
        label: 'Amount',
        value: deal.amount,
      },
      {
        label: 'Closing Date',
        value: deal.closingDate,
      },
      {
        label: 'Stage',
        value: deal.stage,
      },
      {
        label: 'Lead Source',
        value: deal.leadSource,
      },
      {
        label: 'Contact Name',
        value: deal.contactName,
      },
      {
        label: 'Probability (%)',
        value: deal.probability,
      },
      {
        label: 'Description',
        value: deal.description,
      },
    ],
    [deal],
  )

  return (
    <Layout title={`CRM | Deal | ${deal?.name}`} requireLogin>
      <div className="crm-container">
        <DealDetailNavbar deal={deal!} />

        <div className="grid grid-cols-[250px,1fr]">
          <DetailPageSidebar data={dealSidebarOptions} />

          <div>
            <div className="font-semibold mb-4 text-[17px]">Overview</div>
            <ul className="flex flex-col gap-4">
              {dealInfo.map(({ label, value }) => (
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

// Waiting backend api
//export const getServerSideProps: GetServerSideProps = async ({
//req,
//params,
//}) => {
//const client = new QueryClient()
//const token = getSessionToken(req.cookies)
//const id = params?.id as string

//if (token) {
//await Promise.all([client.prefetchQuery(['lead', id], getLead(id, token))])
//}

//return {
//props: {
//dehydratedState: dehydrate(client),
//},
//}
//}

export default DealDetail
