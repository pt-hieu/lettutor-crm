import Layout from '@utils/components/Layout'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title?: string
  sidebar: ReactNode
}

export default function LeadsViewLayout({ children, title, sidebar }: Props) {
  return (
    <Layout key="layout" requireLogin title={title}>
      <div className="crm-container grid grid-cols-[300px,1fr] gap-4">
        {sidebar}
        <div className="overflow-x-hidden">{children}</div>
      </div>
    </Layout>
  )
}