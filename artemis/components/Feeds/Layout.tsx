import React, { ReactNode } from 'react'

import Layout from '@utils/components/Layout'

import { FeedsSidebar } from './Sidebar'

interface Props {
  children: ReactNode
  title?: string
}

const FeedsLayout = ({ children, title }: Props) => {
  return (
    <Layout key="layout" requireLogin title={title}>
      <div className="crm-container grid grid-cols-[300px,1fr] gap-4">
        <FeedsSidebar />
        <div>{children}</div>
      </div>
    </Layout>
  )
}

export default FeedsLayout
