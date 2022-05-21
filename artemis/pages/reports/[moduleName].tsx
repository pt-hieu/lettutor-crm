import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { QueryClient, dehydrate, useQuery } from 'react-query'

import { ReportFilter } from '@components/Reports/Details/Filter'
import { TodaySalesTable } from '@components/Reports/Details/Tables/TodaySales'

import Layout from '@utils/components/Layout'
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

const defaultValues: TReportFilterData = {
  timeFieldName: TimeFieldName.CLOSING_DATE,
  timeFieldType: StaticTime.CurrentMonth,
}

interface IProps {
  module: Module
}

export default ({ module }: IProps) => {
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [filter, setFilter] = useState<TReportFilterData>({})

  const {
    query: { type },
  } = useRouter()

  const { name, meta } = module
  useRelationField(meta)

  const key = [name, page || 1, limit || 10, type, ...Object.values(filter)]

  const { data, isLoading } = useQuery(
    key,
    getDealsReport(name, {
      page,
      limit,
      reportType: type as unknown as ReportType,
      ...filter,
    }),
  )

  const reportName = type || 'Unknown Report'

  return (
    <Layout
      key="layout"
      requireLogin
      title={'Report' + ' | ' + (reportName || '')}
    >
      <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-[999] transform translate-y-[-16px] flex items-center gap-4 px-[60px]">
        <div className="font-semibold text-[17px]">{reportName}</div>
        <ReportFilter defaultValues={defaultValues} onFilter={setFilter} />
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
