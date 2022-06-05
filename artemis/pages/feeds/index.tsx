import React, { useState } from 'react'

import { FeedList } from '@components/Feeds/FeedList'
import FeedsLayout from '@components/Feeds/Layout'
import { StatusAdder } from '@components/Feeds/StatusAdder'

import { FeedType } from '@utils/models/feed'

export default () => {
  const [showStatusAdder, setShowStatusAdder] = useState(true)
  const handleChangeFeedType = (value: FeedType) => {
    setShowStatusAdder(value === FeedType.Status)
  }
  return (
    <FeedsLayout title="CRM | Feed">
      <div className="max-w-[850px] border rounded-md p-5 flex flex-col gap-5">
        {showStatusAdder && <StatusAdder />}
        <FeedList onChangeFeedType={handleChangeFeedType} />
      </div>
    </FeedsLayout>
  )
}
