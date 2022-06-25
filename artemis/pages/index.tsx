import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { QueryClient, dehydrate, useQuery } from 'react-query'

import { ReportViewBoard } from '@components/Home/ReportViewBoard'
import { ViewBoard } from '@components/Home/ViewBoard'
import { formatReportFilter } from '@components/Reports/Details/Filter'

import Layout from '@utils/components/Layout'
import { StaticDateByType } from '@utils/data/report-data'
import { getSessionToken } from '@utils/libs/getToken'
import { Module } from '@utils/models/module'
import {
  DealReportType,
  LeadReportType,
  StaticTime,
  TimeFieldName,
} from '@utils/models/reports'
import { DefaultModule } from '@utils/models/role'
import { TaskStatus } from '@utils/models/task'
import { getModules } from '@utils/service/module'
import { getDealsReport } from '@utils/service/report'
import { getTasks } from '@utils/service/task'

import { taskColumns } from './tasks'

type Props = {
  dehydratedState: any
  modules: Module[] | undefined
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  const promises = [client.prefetchQuery('modules', getModules(token))]
  await Promise.all(promises)
  const modules = client.getQueryData<Module[]>('modules')

  return {
    notFound: !modules,
    props: {
      dehydratedState: dehydrate(client),
      modules,
    },
  }
}

type TProps = {
  modules: Module[]
}

export default function Index({ modules }: TProps) {
  const [leadPage, setLeadPage] = useState<number>(1)
  const [taskPage, setTaskPage] = useState<number>(1)
  const [dealPage, setDealPage] = useState<number>(1)
  const dealReportFixedFilter = {
    timeFieldName: TimeFieldName.CLOSING_DATE,
    timeFieldType: StaticTime.CurrentMonth,
    startDate: StaticDateByType[StaticTime.CurrentMonth][0],
    endDate: StaticDateByType[StaticTime.CurrentMonth][1],
  }
  const leadReportFixedFilter = {
    timeFieldName: TimeFieldName.CREATED_AT,
    timeFieldType: StaticTime.Today,
    singleDate: StaticDateByType[StaticTime.Today] as string,
  }

  const dealKey = [
    DefaultModule.DEAL,
    dealPage || 1,
    10,
    DealReportType.DEALS_CLOSING_THIS_MONTH,
    ...Object.values(dealReportFixedFilter),
  ]

  const leadKey = [
    DefaultModule.LEAD,
    leadPage || 1,
    10,
    LeadReportType.TODAY_LEADS,
    ...Object.values(leadReportFixedFilter),
  ]

  const { data: dealData, isLoading: isLoadingDeal } = useQuery(
    dealKey,
    getDealsReport({
      page: dealPage,
      limit: 10,
      reportType: DealReportType.DEALS_CLOSING_THIS_MONTH,
      ...formatReportFilter(dealReportFixedFilter),
    }),
    {
      enabled: false,
      keepPreviousData: true,
    },
  )

  const { data: leadData, isLoading: isLoadingLead } = useQuery(
    leadKey,
    getDealsReport({
      page: leadPage,
      limit: 10,
      reportType: LeadReportType.TODAY_LEADS,
      ...formatReportFilter(leadReportFixedFilter),
    }),
    {
      enabled: false,
      keepPreviousData: true,
    },
  )

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
        <ReportViewBoard
          title="Deals Closing This Month"
          isLoading={isLoadingDeal}
          page={dealPage}
          data={dealData}
          tableWidth={800}
          onChangePage={setDealPage}
          module={
            modules?.find(
              (module) => module.name === DefaultModule.DEAL,
            ) as Module
          }
        />
        <ReportViewBoard
          title="Today Leads"
          isLoading={isLoadingLead}
          page={leadPage}
          data={leadData}
          tableWidth={800}
          onChangePage={setLeadPage}
          module={
            modules?.find(
              (module) => module.name === DefaultModule.LEAD,
            ) as Module
          }
        />
      </div>
    </Layout>
  )
}
