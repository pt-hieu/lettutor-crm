import { Select, Spin } from 'antd'
import React, { useState } from 'react'
import { useQuery } from 'react-query'

import { FeedTime, FeedType } from '@utils/models/feed'
import { getFeeds } from '@utils/service/feed'

import { FeedContent } from './FeedContent'

const feedTypeOptions = Object.values(FeedType).map((value) => ({
  label: value,
  value,
}))

const feedTimeOptions = Object.values(FeedTime).map((value) => ({
  label: value,
  value,
}))

export const FeedList = () => {
  const [feedType, setFeedType] = useState<FeedType>(FeedType.Status)
  const [feedTime, setFeedTime] = useState<FeedTime>(FeedTime.Now)

  const { data: feeds, isLoading } = useQuery(
    ['feeds', feedType, feedTime],
    getFeeds({ shouldNotPaginate: true, time: feedTime, category: feedType }),
  )

  const handleChangeSelectType = (value: FeedType) => {
    setFeedType(value)
  }

  const handleChangeSelectTime = (value: FeedTime) => {
    setFeedTime(value)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-end">
        <Select
          defaultValue={feedType}
          onChange={handleChangeSelectType}
          size="middle"
          className="!rounded-lg"
          options={feedTypeOptions}
          dropdownMatchSelectWidth={false}
        />
        <Select
          defaultValue={feedTime}
          onChange={handleChangeSelectTime}
          size="middle"
          className="rounded-md"
          options={feedTimeOptions}
          dropdownMatchSelectWidth={false}
        />
      </div>
      <div className="flex flex-col gap-7">
        {isLoading ? (
          <Spin />
        ) : !feeds?.length ? (
          <div className="text-[17px] font-semibold text-gray-400 text-center py-[60px]">
            No Feeds Found!
          </div>
        ) : (
          feeds.map((feed, index) => <FeedContent key={index} feed={feed} />)
        )}
      </div>
    </div>
  )
}
