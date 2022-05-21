import { useRouter } from 'next/router'
import React from 'react'

import {
  ReportFilter,
  TReportFilterData,
} from '@components/Reports/Details/Filter'
import { TodaySalesTable } from '@components/Reports/Details/Tables/TodaySales'

import Layout from '@utils/components/Layout'
import { StaticTime, TimeFieldName, TimeFieldType } from '@utils/models/reports'

const defaultValues: TReportFilterData = {
  timeFieldName: TimeFieldName.CLOSING_DATE,
  timeFieldType: StaticTime.CurrentMonth,
}

export default () => {
  const {
    query: { type },
  } = useRouter()
  return (
    <Layout key="layout" requireLogin title={'Report' + ' | ' + (type || '')}>
      <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-[999] transform translate-y-[-16px] flex items-center gap-4 px-[60px]">
        <div className="font-semibold text-[17px]">{type}</div>
        <ReportFilter defaultValues={defaultValues} />
      </div>

      <div className="px-[60px]">
        <TodaySalesTable />
      </div>
    </Layout>
  )
}
