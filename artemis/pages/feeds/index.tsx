import React from 'react'

import { FeedList } from '@components/Feeds/FeedList'
import FeedsLayout from '@components/Feeds/Layout'
import { StatusAdder } from '@components/Feeds/StatusAdder'

export default () => {
  return (
    <FeedsLayout title="CRM | Feed">
      <div className="max-w-[850px] border rounded-md p-5 flex flex-col gap-5">
        <StatusAdder />
        <FeedList />
      </div>
    </FeedsLayout>
  )
}
