import moment from 'moment'
import Link from 'next/link'
import React from 'react'
import { ReactNode } from 'react-markdown/lib/react-markdown'

import File from '@components/Notes/File'

import { getAvatarLinkByName } from '@utils/libs/avatar'
import { Feed, FeedComment } from '@utils/models/feed'

import { CommentAdder } from './CommentAdder'

interface IProps {
  feed: Feed
}

export const FeedContent = ({ feed }: IProps) => {
  const { owner, time, content, files, comments } = feed
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
        <PostedContent
          content={content}
          files={files}
          className="bg-slate-50"
        />
        <div className="border p-3 rounded-xl flex flex-col gap-3">
          {!comments?.length ? null : (
            <div className="flex flex-col gap-3">
              {comments.map((comment, index) => (
                <Comment key={index} comment={comment} />
              ))}
            </div>
          )}
          <CommentAdder />
        </div>
      </div>
    </div>
  )
}

interface IContentProps {
  content: string | ReactNode
  files?: { filename: string }[]
  className?: string
}

const PostedContent = ({ content, files, className }: IContentProps) => {
  return (
    <div
      className={`border p-3 w-fit rounded-xl flex flex-col gap-3 ${
        className ? className : ''
      }`}
    >
      <div>{content}</div>
      {!files?.length ? null : (
        <div className="flex gap-2">
          {files.map(({ filename }) => (
            <File key={filename} filename={filename} location={filename} />
          ))}
        </div>
      )}
    </div>
  )
}

interface ICommentProps {
  comment: FeedComment
}

const Comment = ({ comment }: ICommentProps) => {
  const { owner, content, files, createdAt } = comment
  const contentRender = (
    <div className="text-[14px]">
      <Link href={`/user/${owner.id}`}>
        <a className="font-semibold">{owner.name}</a>
      </Link>
      <div>{content}</div>
    </div>
  )
  return (
    <div className="flex gap-2">
      <div className="w-[44px]">
        <img
          className="w-10 h-10 rounded-full"
          alt="Avatar"
          src={getAvatarLinkByName(owner.name)}
        />
      </div>
      <div>
        <PostedContent
          content={contentRender}
          files={files}
          className="bg-[#fafafa]"
        />
        <span className="text-[12px] text-gray-500">
          {moment(createdAt).calendar()}
        </span>
      </div>
    </div>
  )
}

function getFeedTitle(feed: Feed) {
  return feed.action + ' a ' + feed.type.toLowerCase()
}
