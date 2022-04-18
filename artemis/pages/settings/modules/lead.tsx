import { Tabs } from 'antd'
import React from 'react'

import { Sidebar } from '@components/Settings/Customization/Sidebar'

import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'

const { TabPane } = Tabs

interface Props {
  title?: string
}

const LeadCustom = ({ title }: Props) => {
  return (
    <Layout
      key="layout"
      requireLogin
      title={title}
      header={false}
      footer={false}
    >
      <div className="grid grid-cols-[340px,1fr] grid-rows-[60px,1fr] h-screen overflow-hidden">
        <div className="col-span-2 border-b flex justify-between items-center px-4">
          <div>Lead</div>
          <div className="flex gap-4">
            <button type="button" className="crm-button-outline">
              <span className="fa fa-times mr-2" />
              Cancel
            </button>

            <button type="submit" className="crm-button">
              <Loading on={false}>
                <span className="fa fa-check mr-2" />
                Save
              </Loading>
            </button>
          </div>
        </div>
        <Sidebar />
        <div className="px-[64px] overflow-hidden grid grid-rows-[60px,1fr]">
          <Tabs defaultActiveKey="1">
            <TabPane tab={<span>CREATE VIEW</span>} key="1"></TabPane>
            <TabPane tab={<span>DETAIL VIEW</span>} key="2"></TabPane>
          </Tabs>
          <div className="overflow-y-auto">Main</div>
        </div>
      </div>
    </Layout>
  )
}

export default LeadCustom
