import { notification } from 'antd'
import moment from 'moment'
import React from 'react'
import { ReactNode } from 'react-markdown/lib/react-markdown'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import File from '@components/Notes/File'

import Confirm from '@utils/components/Confirm'
import { useModal } from '@utils/hooks/useModal'
import { getAvatarLinkByName } from '@utils/libs/avatar'
import { FeedComment, FeedStatus } from '@utils/models/feed'
import { Attachments } from '@utils/models/note'
import { deleteComment, deleteStatus, getComments } from '@utils/service/feed'

import { CommentAdder } from './CommentAdder'

interface IProps {
  feed: FeedStatus
}

export const FeedContent = ({ feed }: IProps) => {
  const { owner, createdAt, content, attachments: attacments, id } = feed

  const { data: comments } = useQuery(['comments', id], getComments(id))
  const client = useQueryClient()

  const { mutateAsync: deleteStatusService } = useMutation(
    'delete-status',
    deleteStatus,
    {
      onSuccess() {
        client.invalidateQueries(['feeds'])
      },
      onError() {
        notification.error({ message: 'Delete status unsuccessfully' })
      },
    },
  )

  const handleDeleteStatus = (id: string) => {
    deleteStatusService({ id })
  }

  return (
    <div className="flex gap-3">
      <img
        className="w-10 h-10 rounded-full"
        alt="Avatar"
        src={getAvatarLinkByName(owner.name)}
      />
      <div className="flex-1 flex flex-col gap-2">
        <div>
          <div>
            <span className="font-semibold mr-1">{owner.name}</span>
            {getFeedTitle(feed)}
          </div>
          <div className="text-[12px] text-gray-600">
            {moment(createdAt).calendar()}
          </div>
        </div>
        <PostedContent
          content={content}
          files={attacments}
          className="bg-gray-100"
          onDelete={handleDeleteStatus}
          id={id}
        />
        <div className="border p-3 rounded-xl flex flex-col gap-3">
          {!comments?.length ? null : (
            <div className="flex flex-col gap-3">
              {comments.map((comment, index) => (
                <Comment key={index} comment={comment} />
              ))}
            </div>
          )}
          <CommentAdder statusId={id} />
        </div>
      </div>
    </div>
  )
}

interface IContentProps {
  content: string | ReactNode
  files?: Attachments[]
  className?: string
  onDelete: (id: string) => void
  id: string
}

const PostedContent = ({
  content,
  files,
  className,
  onDelete,
  id,
}: IContentProps) => {
  const [confirm, openConfirm, closeConfirm] = useModal()

  const handleDelete = () => {
    onDelete(id)
  }

  return (
    <div className="relative group">
      <div
        className={`border p-3 w-fit rounded-xl flex flex-col gap-3 ${
          className ? className : ''
        }`}
      >
        <div className="break-all">{content}</div>
        {!files?.length ? null : (
          <div className="flex gap-2">
            {files.map(({ key, location }) => (
              <File key={key} filename={key} location={location} />
            ))}
          </div>
        )}
      </div>
      <div className="absolute hidden top-2 right-0 group-hover:flex flex-row gap-3">
        <button
          className="crm-icon-btn hover:border-red-500 hover:text-red-500 "
          onClick={openConfirm}
        >
          <i className="fa fa-trash" />
        </button>
      </div>

      <Confirm
        danger
        visible={confirm}
        close={closeConfirm}
        message={'Are you sure you want to delete'}
        onYes={handleDelete}
      />
    </div>
  )
}

interface ICommentProps {
  comment: FeedComment
}

const Comment = ({ comment }: ICommentProps) => {
  const {
    owner,
    content,
    attachments: attacments,
    createdAt,
    statusId,
    id,
  } = comment

  const client = useQueryClient()

  const { mutateAsync: deleteCommentService } = useMutation(
    'delete-comment',
    deleteComment,
    {
      onSuccess() {
        client.invalidateQueries(['comments'])
      },
      onError() {
        notification.error({ message: 'Delete comment unsuccessfully' })
      },
    },
  )

  const handleDeleteComment = (id: string) => {
    deleteCommentService({ id })
  }

  const contentRender = (
    <div className="text-[14px] -my-1">
      <span className="font-semibold">{owner.name}</span>
      <div className="break-all">{content}</div>
    </div>
  )
  return (
    <div className="flex gap-3">
      <img
        className="w-10 h-10 rounded-full"
        alt="Avatar"
        src={getAvatarLinkByName(owner.name)}
      />
      <div className="flex-1">
        <PostedContent
          onDelete={handleDeleteComment}
          content={contentRender}
          files={attacments}
          className="bg-[#fafafa]"
          id={id}
        />
        <span className="text-[12px] text-gray-500">
          {moment(createdAt).calendar()}
        </span>
      </div>
    </div>
  )
}

function getFeedTitle(feed: FeedStatus) {
  return 'created' + ' a ' + 'status'
}
