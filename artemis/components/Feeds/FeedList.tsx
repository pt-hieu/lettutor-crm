import { Select } from 'antd'
import React, { useState } from 'react'

import { Feed, FeedTime, FeedType } from '@utils/models/feed'

import { FeedContent } from './FeedContent'

const feedTypeOptions = [
  { label: 'All', value: '' },
  ...Object.values(FeedType).map((value) => ({ label: value, value })),
]

const feedTimeOptions = [
  { label: 'Now', value: '' },
  ...Object.values(FeedTime).map((value) => ({ label: value, value })),
]

const feeds: Feed[] = [
  {
    type: FeedType.Status,
    action: 'posted',
    time: new Date(),
    content: 'This is a content of status',
    owner: {
      id: 'abc',
      name: 'Le Hao',
    },
    files: [
      {
        name: 'File Name 1',
        id: 'File Name 1',
      },
      {
        name: 'File Name 2',
        id: 'File Name 2',
      },
      {
        name: 'File Name 3',
        id: 'File Name 3',
      },
      {
        name: 'File Name 4',
        id: 'File Name 4',
      },
      {
        name: 'File Name 5',
        id: 'File Name 5',
      },
    ],
  },
  {
    type: FeedType.Status,
    action: 'posted',
    time: new Date(),
    content: 'This is a content of status',
    owner: {
      id: 'abc',
      name: 'Le 2121',
    },
    files: [
      {
        name: 'File Name 1',
        id: 'File Name 1',
      },
      {
        name: 'File Name 2',
        id: 'File Name 2',
      },
      {
        name: 'File Name 3',
        id: 'File Name 3',
      },
      {
        name: 'File Name 4',
        id: 'File Name 4',
      },
      {
        name: 'File Name 5',
        id: 'File Name 5',
      },
    ],
  },
]

export const FeedList = () => {
  const [feedType, setFeedType] = useState<FeedType | ''>('')
  const [feedTime, setFeedTime] = useState<FeedTime | ''>('')

  const handleChangeSelectType = (value: FeedType | '') => {
    setFeedType(value)
  }
  const handleChangeSelectTime = (value: FeedTime | '') => {
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
        {feeds.map((feed) => (
          <FeedContent feed={feed} />
        ))}
      </div>
    </div>
  )
}
