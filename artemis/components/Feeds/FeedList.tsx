import { Select, Spin } from 'antd'
import React, { useState } from 'react'
import { useQuery } from 'react-query'

import { mapLog } from '@utils/libs/mapLog'
import { FeedStatus, FeedTime, FeedType } from '@utils/models/feed'
import { Log } from '@utils/models/log'
import { getRawDealStage } from '@utils/service/deal'
import { getFeeds } from '@utils/service/feed'

import { LogContent, StatusContent } from './FeedContent'

const feedTypeOptions = Object.values(FeedType).map((value) => ({
  label: value,
  value,
}))

const feedTimeOptions = Object.values(FeedTime).map((value) => ({
  label: value,
  value,
}))

interface IProps {
  onChangeFeedType: (value: FeedType) => void
}

export const FeedList = ({ onChangeFeedType }: IProps) => {
  const [feedType, setFeedType] = useState<FeedType>(FeedType.Status)
  const [feedTime, setFeedTime] = useState<FeedTime>(FeedTime.Now)

  const { data: feeds, isLoading } = useQuery(
    ['feeds', feedType, feedTime],
    getFeeds({ shouldNotPaginate: true, time: feedTime, category: feedType }),
  )

  const { data: stages } = useQuery('deal-stage-raw', getRawDealStage, {
    enabled: feedType === FeedType.Deals,
  })

  const mapFeeds =
    feedType !== FeedType.Status
      ? mapLog((feeds || []) as Log[], stages || [])
      : (feeds as FeedStatus[])

  const handleChangeSelectType = (value: FeedType) => {
    onChangeFeedType(value)
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
          mapFeeds.map((feed, index) =>
            feedType === FeedType.Status ? (
              <StatusContent key={index} feed={feed as FeedStatus} />
            ) : (
              <LogContent
                key={index}
                log={feed as Log}
                index={index}
                type={feedType}
              />
            ),
          )
        )}
      </div>
    </div>
  )
}
