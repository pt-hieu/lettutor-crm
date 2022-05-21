import { Table, TableColumnsType } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'

import { toCapitalizedWords } from '@components/Module/OverviewView'
import ReportsLayout from '@components/Reports/Layout'

import { DealReports } from '@utils/data/report-data'
import { TReport } from '@utils/models/reports'

export default () => {
  const {
    query: { module },
  } = useRouter()

  const columns = useMemo<TableColumnsType<TReport>>(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: { compare: (a, b) => a.name.localeCompare(b.name) },
        key: 'name',
        render: (_, { name }) => (
          <Link
            href={{
              pathname: `/reports/${module}`,
              query: { type: name },
            }}
          >
            <a className="capitalize crm-link underline hover:underline">
              {name}
            </a>
          </Link>
        ),
      },
      { title: 'Description', dataIndex: 'description' },
    ],
    [module],
  )

  return (
    <ReportsLayout title="CRM | Report">
      <div>
        <div className="font-medium text-xl mb-4 py-2">
          {toCapitalizedWords(module + ' Reports')}
        </div>

        <Table
          showSorterTooltip={false}
          columns={columns}
          pagination={false}
          bordered
          rowKey={(u) => u.name}
          dataSource={DealReports}
        />
      </div>
    </ReportsLayout>
  )
}
