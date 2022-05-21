import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { QueryClient, dehydrate, useQuery } from 'react-query'

import {
  ReportFilter,
  formatReportFilter,
} from '@components/Reports/Details/Filter'
import { TodaySalesTable } from '@components/Reports/Details/Tables/TodaySales'

import Layout from '@utils/components/Layout'
import { StaticDateByType } from '@utils/data/report-data'
import { useRelationField } from '@utils/hooks/useRelationField'
import { getSessionToken } from '@utils/libs/getToken'
import { Module } from '@utils/models/module'
import {
  ReportType,
  StaticTime,
  TReportFilterData,
  TimeFieldName,
} from '@utils/models/reports'
import { getModules } from '@utils/service/module'
import { getDealsReport } from '@utils/service/report'

interface IProps {
  module: Module
}

const FilterByReportType: Record<ReportType, TReportFilterData> = {
  [ReportType.LOST_DEALS]: {},
  [ReportType.OPEN_DEALS]: {},
  [ReportType.PIPELINE_BY_PROBABILITY]: {},

  [ReportType.PIPELINE_BY_STAGE]: {},
  [ReportType.SALES_BY_LEAD_SOURCE]: {},
  [ReportType.SALES_PERSON_PERFORMANCE]: {},
  [ReportType.DEALS_CLOSING_THIS_MONTH]: {
    timeFieldName: TimeFieldName.CLOSING_DATE,
    timeFieldType: StaticTime.CurrentMonth,
    startDate: StaticDateByType[StaticTime.CurrentMonth][0],
    endDate: StaticDateByType[StaticTime.CurrentMonth][1],
  },
  [ReportType.THIS_MONTH_SALES]: {
    timeFieldName: TimeFieldName.CLOSING_DATE,
    timeFieldType: StaticTime.CurrentMonth,
    startDate: StaticDateByType[StaticTime.CurrentMonth][0],
    endDate: StaticDateByType[StaticTime.CurrentMonth][1],
  },
  [ReportType.TODAY_SALES]: {
    timeFieldName: TimeFieldName.CLOSING_DATE,
    timeFieldType: StaticTime.Today,
    singleDate: StaticDateByType[StaticTime.Today] as string,
  },
}

export default ({ module }: IProps) => {
  const {
    query: { type },
  } = useRouter()

  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [filter, setFilter] = useState<TReportFilterData>(
    FilterByReportType[type as ReportType] || {},
  )

  const { name, meta } = module
  useRelationField(meta)

  const key = [name, page || 1, limit || 10, type, ...Object.values(filter)]

  const { data, isLoading } = useQuery(
    key,
    getDealsReport(name, {
      page,
      limit,
      reportType: type as unknown as ReportType,
      ...formatReportFilter(filter),
    }),
  )

  const handleFilter = (value: TReportFilterData) => {
    setFilter(value)
  }

  const reportName = type || 'Unknown Report'

  return (
    <Layout
      key="layout"
      requireLogin
      title={'Report' + ' | ' + (reportName || '')}
    >
      <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-[999] transform translate-y-[-16px] flex items-center gap-4 px-[60px]">
        <div className="font-semibold text-[17px]">{reportName}</div>
        <ReportFilter
          defaultValues={FilterByReportType[type as ReportType] || {}}
          onFilter={handleFilter}
        />
      </div>

      <div className="px-[60px]">
        <TodaySalesTable module={module} data={data} isLoading={isLoading} />
      </div>
    </Layout>
  )
}

type Props = {
  dehydratedState: any
  module: Module | undefined
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  query,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  const promises = [client.prefetchQuery('modules', getModules(token))]

  await Promise.all(promises)

  const modules = client.getQueryData<Module[]>('modules')
  const currentModule = modules?.find(
    (module) => module.name === query.moduleName,
  )

  return {
    notFound: !currentModule,
    props: {
      dehydratedState: dehydrate(client),
      module: currentModule,
    },
  }
}
