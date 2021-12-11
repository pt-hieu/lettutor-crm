import Layout from '@utils/components/Layout'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import { getSessionToken } from '@utils/libs/getToken'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import DealDetailNavbar from 'components/Deals/DealDetailNavbar'
import { ReactNode, useMemo } from 'react'
import { getDeal } from '@utils/service/deal'
import { Deal } from '@utils/models/deal'

type DealInfo = {
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

  const { data: deal } = useQuery<Deal>(['deal', id], {
    enabled: false,
  })

  const dealInfo = useMemo(
    (): DealInfo[] => [
      {
        label: 'Deal Owner',
        value: deal?.owner.name,
      },
      {
        label: 'Deal Name',
        value: deal?.fullName,
      },
      {
        label: 'Account Name',
        value: deal?.account.fullName,
      },
      {
        label: 'Amount',
        value: deal?.amount,
      },
      {
        label: 'Closing Date',
        value: deal?.closingDate,
      },
      {
        label: 'Stage',
        value: deal?.stage,
      },
      {
        label: 'Lead Source',
        value: deal?.source,
      },
      {
        label: 'Contact Name',
        value: deal?.contact?.fullName,
      },
      {
        label: 'Probability (%)',
        value: deal?.probability,
      },
      {
        label: 'Description',
        value: deal?.description,
      },
    ],
    [deal],
  )

  return (
    <Layout title={`CRM | Deal | ${deal?.fullName}`} requireLogin>
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

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)
  const id = params?.id as string

  if (token) {
    await Promise.all([client.prefetchQuery(['deal', id], getDeal(id, token))])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default DealDetail
