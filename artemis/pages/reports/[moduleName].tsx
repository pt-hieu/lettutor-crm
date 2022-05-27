import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { ReactNode, useMemo, useState } from 'react'
import { QueryClient, dehydrate, useQuery } from 'react-query'

import {
  ReportFilter,
  formatReportFilter,
} from '@components/Reports/Details/Filter'
import { BasicTable } from '@components/Reports/Details/Tables/BasicTable'
import { GroupedTable } from '@components/Reports/Details/Tables/GroupedTable'

import Layout from '@utils/components/Layout'
import { StaticDateByType } from '@utils/data/report-data'
import { useRelationField } from '@utils/hooks/useRelationField'
import { getSessionToken } from '@utils/libs/getToken'
import { Module } from '@utils/models/module'
import {
  DealReportType,
  LeadReportType,
  ReportType,
  StaticTime,
  TReportFilterData,
  TimeFieldName,
} from '@utils/models/reports'
import { getModules } from '@utils/service/module'
import { getDealsReport } from '@utils/service/report'

const FilterByReportType: Record<ReportType, TReportFilterData> = {
  [DealReportType.LOST_DEALS]: {},
  [DealReportType.OPEN_DEALS]: {},
  [DealReportType.PIPELINE_BY_PROBABILITY]: {},
  [DealReportType.PIPELINE_BY_STAGE]: {},
  [DealReportType.SALES_BY_LEAD_SOURCE]: {},
  [DealReportType.SALES_PERSON_PERFORMANCE]: {},
  [DealReportType.DEALS_CLOSING_THIS_MONTH]: {
    timeFieldName: TimeFieldName.CLOSING_DATE,
    timeFieldType: StaticTime.CurrentMonth,
    startDate: StaticDateByType[StaticTime.CurrentMonth][0],
    endDate: StaticDateByType[StaticTime.CurrentMonth][1],
  },
  [DealReportType.THIS_MONTH_SALES]: {
    timeFieldName: TimeFieldName.CLOSING_DATE,
    timeFieldType: StaticTime.CurrentMonth,
    startDate: StaticDateByType[StaticTime.CurrentMonth][0],
    endDate: StaticDateByType[StaticTime.CurrentMonth][1],
  },
  [DealReportType.TODAY_SALES]: {
    timeFieldName: TimeFieldName.CLOSING_DATE,
    timeFieldType: StaticTime.Today,
    singleDate: StaticDateByType[StaticTime.Today] as string,
  },

  [LeadReportType.CONVERTED_LEADS]: {},
  [LeadReportType.LEADS_BY_OWNERSHIP]: {},
  [LeadReportType.LEADS_BY_SOURCE]: {},
  [LeadReportType.LEADS_BY_STATUS]: {},
  [LeadReportType.TODAY_LEADS]: {
    timeFieldName: TimeFieldName.CREATED_AT,
    timeFieldType: StaticTime.Today,
    singleDate: StaticDateByType[StaticTime.Today] as string,
  },
}

interface IProps {
  module: Module
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
    getDealsReport({
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

  const TableByType = useMemo<Record<ReportType, ReactNode>>(
    () => ({
      [DealReportType.LOST_DEALS]: (
        <BasicTable module={module} data={data} isLoading={isLoading} />
      ),
      [DealReportType.OPEN_DEALS]: (
        <BasicTable module={module} data={data} isLoading={isLoading} />
      ),
      [DealReportType.DEALS_CLOSING_THIS_MONTH]: (
        <BasicTable module={module} data={data} isLoading={isLoading} />
      ),
      [DealReportType.THIS_MONTH_SALES]: (
        <BasicTable module={module} data={data} isLoading={isLoading} />
      ),
      [DealReportType.TODAY_SALES]: (
        <BasicTable module={module} data={data} isLoading={isLoading} />
      ),
      [DealReportType.PIPELINE_BY_PROBABILITY]: (
        <GroupedTable
          module={module}
          data={data}
          isLoading={isLoading}
          dataKey="probability"
        />
      ),
      [DealReportType.PIPELINE_BY_STAGE]: (
        <GroupedTable
          module={module}
          data={data}
          isLoading={isLoading}
          dataKey="stageId"
          relationTo="dealstage"
        />
      ),
      [DealReportType.SALES_BY_LEAD_SOURCE]: (
        <GroupedTable
          module={module}
          data={data}
          isLoading={isLoading}
          dataKey="source"
        />
      ),
      [DealReportType.SALES_PERSON_PERFORMANCE]: (
        <GroupedTable
          module={module}
          data={data}
          isLoading={isLoading}
          dataKey="ownerId"
          relationTo="user"
        />
      ),

      [LeadReportType.CONVERTED_LEADS]: (
        <BasicTable module={module} data={data} isLoading={isLoading} />
      ),
      [LeadReportType.TODAY_LEADS]: (
        <BasicTable module={module} data={data} isLoading={isLoading} />
      ),
      [LeadReportType.LEADS_BY_OWNERSHIP]: (
        <GroupedTable
          module={module}
          data={data}
          isLoading={isLoading}
          dataKey="ownerId"
          relationTo="user"
        />
      ),
      [LeadReportType.LEADS_BY_SOURCE]: (
        <GroupedTable
          module={module}
          data={data}
          isLoading={isLoading}
          dataKey="source"
        />
      ),
      [LeadReportType.LEADS_BY_STATUS]: (
        <GroupedTable
          module={module}
          data={data}
          isLoading={isLoading}
          dataKey="status"
        />
      ),
    }),
    [data, module, isLoading],
  )

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
          moduleName={module.name}
        />
      </div>

      <div className="px-[60px]">{TableByType[type as ReportType]}</div>
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
