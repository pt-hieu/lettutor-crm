import { useRouter } from 'next/router'
import React from 'react'

import ReportNavbar from '@components/Reports/Details/Navbar'

import Layout from '@utils/components/Layout'

export default () => {
  const {
    query: { type },
  } = useRouter()
  return (
    <Layout key="layout" requireLogin title={'Report' + ' | ' + (type || '')}>
      <ReportNavbar />
    </Layout>
  )
}
