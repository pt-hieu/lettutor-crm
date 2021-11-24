import Layout from '@utils/components/Layout'
import Sidebar from '@components/Settings/Sidebar'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title?: string
}

export default function SettingsLayout({ children, title }: Props) {
  return (
    <Layout requireLogin title={title}>
      <div className="crm-container grid grid-cols-[300px,1fr] gap-4">
        <Sidebar />
        <div>{children}</div>
      </div>
    </Layout>
  )
}
