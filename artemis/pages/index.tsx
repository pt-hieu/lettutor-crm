import moment from 'moment'
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { QueryClient, dehydrate, useQuery } from 'react-query'

import { ViewBoard } from '@components/Home/ViewBoard'

import Layout from '@utils/components/Layout'
import { getSessionToken } from '@utils/libs/getToken'
import { TaskStatus } from '@utils/models/task'
import { getTasks } from '@utils/service/task'

// import { leadColumns } from './leads'
import { taskColumns } from './tasks'

export default function Index() {
  const [leadPage, setLeadPage] = useState<number>(1)
  const [taskPage, setTaskPage] = useState<number>(1)
  const [dealPage, setDealPage] = useState<number>(1)

  const { data: tasks, isLoading: tasksLoading } = useQuery(
    ['tasks', taskPage],
    getTasks({
      page: taskPage,
      status: Object.values(TaskStatus).filter(
        (s) => s !== TaskStatus.COMPLETED,
      ),
    }),
    {
      keepPreviousData: true,
    },
  )

  // const { data: leads, isLoading: leadsLoading } = useQuery(
  //   ['leads', leadPage],
  //   getLeads({ page: leadPage, from: moment().startOf('day').toDate() }),
  //   {
  //     keepPreviousData: true,
  //   },
  // )

  // const { data: deals, isLoading: dealsLoading } = useQuery(
  //   ['deals', dealPage],
  //   getDeals({
  //     page: dealPage,
  //     closeFrom: moment().startOf('month').toDate(),
  //     closeTo: moment().endOf('month').toDate(),
  //   }),
  //   {
  //     keepPreviousData: true,
  //   },
  // )

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

        {/* <ViewBoard
          title="Today's Leads"
          columns={leadColumns}
          page={leadPage}
          onChangePage={setLeadPage}
          data={leads}
          isLoading={leadsLoading}
        /> */}

        {/* <ViewBoard
          title="Deals Closing This Month "
          columns={dealColumns}
          page={dealPage}
          onChangePage={setDealPage}
          data={deals}
          isLoading={dealsLoading}
          tableWidth={1200}
        /> */}
      </div>
    </Layout>
  )
}

// export const getServerSideProps: GetServerSideProps = async ({
//   req,
//   query: q,
// }) => {
//   const client = new QueryClient()
//   const token = getSessionToken(req.cookies)

//   const page = Number(q.page) || 1
//   if (token) {
//     await Promise.all([
//       client.prefetchQuery(
//         ['leads', page],
//         getLeads({ page, from: moment().startOf('day').toDate() }, token),
//       ),
//       client.prefetchQuery(
//         ['tasks', page],
//         getTasks(
//           {
//             page,
//             status: Object.values(TaskStatus).filter(
//               (s) => s !== TaskStatus.COMPLETED,
//             ),
//           },
//           token,
//         ),
//       ),
//       client.prefetchQuery(
//         ['deals', page],
//         getDeals(
//           {
//             page,
//             closeFrom: moment().startOf('month').toDate(),
//             closeTo: moment().endOf('month').toDate(),
//           },
//           token,
//         ),
//       ),
//     ])
//   }

//   return {
//     props: {
//       dehydratedState: dehydrate(client),
//     },
//   }
// }
