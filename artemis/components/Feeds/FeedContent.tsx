import moment from 'moment'
import Link from 'next/link'
import React from 'react'

import { getAvatarLinkByName } from '@utils/libs/avatar'
import { Feed } from '@utils/models/feed'

import { CommentAdder } from './CommentAdder'

interface IProps {
  feed: Feed
}

export const FeedContent = ({ feed }: IProps) => {
  const { owner, time, content, files } = feed
  return (
    <div className="flex gap-2">
      <div className="w-[44px]">
        <img
          className="w-10 h-10 rounded-full"
          alt="Avatar"
          src={getAvatarLinkByName(owner.name)}
        />
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div>
          <div>
            <Link href={`/user/${owner.id}`}>
              <a className="font-semibold mr-1">{owner.name}</a>
            </Link>
            {getFeedTitle(feed)}
          </div>
          <div className="text-[12px] text-gray-600">
            {moment(time).calendar()}
          </div>
        </div>
        <div className="border p-3 w-fit rounded-md">
          <p className="mb-3">{content}</p>
          <div className="flex gap-2 mb-4">
            {files?.map(({ name, id }) => (
              <FileItem key={id} name={name} />
            ))}
          </div>
        </div>
        <div className="border p-3 rounded-md">
          <CommentAdder />
        </div>
      </div>
    </div>
  )
}

const FileItem = ({ name }: { name: string; id?: string }) => (
  <div className="border w-[100px] h-[100px] flex items-center justify-center p-4 text-center rounded-md">
    <p>{name}</p>
  </div>
)

function getFeedTitle(feed: Feed) {
  return feed.action + ' a ' + feed.type.toLowerCase()
}
