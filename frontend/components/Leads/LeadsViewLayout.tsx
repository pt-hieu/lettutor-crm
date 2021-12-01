import Layout from '@utils/components/Layout'
import { ReactNode } from 'react'
import LeadSidebar from './Sidebar'

interface Props {
  children: ReactNode
  title?: string
}

export default function LeadsViewLayout({ children, title }: Props) {
  return (
    <Layout key="layout" requireLogin title={title}>
      <div className="crm-container grid grid-cols-[300px,1fr] gap-4">
        <LeadSidebar />
        <div className="overflow-x-hidden">{children}</div>
      </div>
    </Layout>
  )
}
