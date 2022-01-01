import { ViewBoard } from '@components/Home/ViewBoard'
import Layout from '@utils/components/Layout'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Paginate } from '@utils/models/paging'
import { getDeals } from '@utils/service/deal'
import { getLeads } from '@utils/service/lead'
import { getTasks } from '@utils/service/task'
import { Empty, Pagination, Spin, Table, TableColumnType } from 'antd'
import { GetServerSideProps } from 'next'
import { useEffect, useState } from 'react'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import { dealColumns } from './deals'
import { leadColumns } from './leads'
import { taskColumns } from './tasks'

export default function Index() {
  const [leadPage, setLeadPage] = useState<number>(1)
  const [taskPage, setTaskPage] = useState<number>(1)
  const [dealPage, setDealPage] = useState<number>(1)

  const { data: tasks, isLoading: tasksLoading } = useQuery(
    ['tasks', taskPage],
    getTasks({ page: taskPage, isOpen: true }),
  )

  const { data: leads, isLoading: leadsLoading } = useQuery(
    ['leads', leadPage],
    getLeads({ page: leadPage, isToday: true }),
  )

  const { data: deals, isLoading: dealsLoading } = useQuery(
    ['deals', dealPage],
    getDeals({ page: dealPage, isCurrentMonth: true }),
  )

  return (
    <Layout requireLogin>
      <div className="crm-container grid grid-cols-2 gap-4">
        <ViewBoard
          title="Open Tasks"
          columns={taskColumns}
          page={taskPage}
          onChangePage={setTaskPage}
          data={tasks}
          isLoading={tasksLoading}
          tableWidth={800}
        />
        <ViewBoard
          title="Today's Leads"
          columns={leadColumns}
          page={leadPage}
          onChangePage={setLeadPage}
          data={leads}
          isLoading={leadsLoading}
        />
        <ViewBoard
          title="Deals Closing This Month "
          columns={dealColumns}
          page={dealPage}
          onChangePage={setDealPage}
          data={deals}
          isLoading={dealsLoading}
          tableWidth={1200}
        />
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query: q,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  const page = Number(q.page) || 1
  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['leads', page],
        getLeads({ page, isToday: true }, token),
      ),
      client.prefetchQuery(
        ['tasks', page],
        getTasks({ page, isOpen: true }, token),
      ),
      client.prefetchQuery(
        ['deals', page],
        getDeals({ page, isCurrentMonth: true }, token),
      ),
    ])
  }

  return {
    notFound: investigate(
      client,
      ['leads', page],
      ['tasks', page],
      ['deals', page],
    ).isError,
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}
