import Layout from '@utils/components/Layout'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title?: string
}

export default function LeadsAddLayout({ children, title }: Props) {
  return (
    <Layout key="layout" requireLogin title={title}>
      <div className="crm-container">
        <div>{children}</div>
      </div>
    </Layout>
  )
}
