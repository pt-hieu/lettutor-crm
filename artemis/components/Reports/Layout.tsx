import React, { ReactNode } from 'react'

import { ReportsSidebar } from '@components/Reports/Sidebar'

import Layout from '@utils/components/Layout'

interface Props {
  children: ReactNode
  title?: string
}

const ReportsLayout = ({ children, title }: Props) => {
  return (
    <Layout key="layout" requireLogin title={title}>
      <div className="crm-container grid grid-cols-[300px,1fr] gap-4">
        <ReportsSidebar />
        <div>{children}</div>
      </div>
    </Layout>
  )
}

export default ReportsLayout
