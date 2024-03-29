import { notification } from 'antd'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'

import { useTypedSession } from '@utils/hooks/useTypedSession'
import { AddCommentDto, FeedType } from '@utils/models/feed'
import { addComment } from '@utils/service/feed'

import { FeedTextbox, IFeedTextboxData } from './FeedTextbox'

interface ICommentAdderProps {
  feedId: string
  type: FeedType
}

export const CommentAdder = ({ feedId, type }: ICommentAdderProps) => {
  const [isActive, setIsActive] = useState(false)
  const client = useQueryClient()
  const [session] = useTypedSession()

  const { mutateAsync: addCommentService, isLoading } = useMutation(
    'add-comment',
    addComment,
    {
      onSuccess() {
        client.invalidateQueries(['comments', feedId])
        setIsActive(false)
      },
      onError() {
        notification.error({ message: 'Add comment unsuccessfully' })
      },
    },
  )

  const handlePostStatus = (data: IFeedTextboxData) => {
    const newData: AddCommentDto = {
      ...data,
      ownerId: session?.user.id as string,
    }
    if (type === FeedType.Status) {
      newData.statusId = feedId
    } else {
      newData.logId = feedId
    }
    addCommentService(newData)
  }

  const placeholder = 'Write a comment.'

  const prefix = (
    <i className="fa fa-comments text-[17px] text-gray-500 m-1 mt-2" />
  )

  return (
    <div className="flex-1">
      {isActive ? (
        <FeedTextbox
          onCancel={() => setIsActive(false)}
          onSubmit={handlePostStatus}
          isLoading={isLoading}
          placeholder={placeholder}
          prefix={prefix}
          maxContent={250}
        />
      ) : (
        <div
          className="border rounded-xl px-2 pb-1 hover:border-blue-500 text-gray-500 flex items-center cursor-text"
          onClick={() => setIsActive(true)}
        >
          {prefix}
          <div className="p-2 pt-3">{placeholder}</div>
        </div>
      )}
    </div>
  )
}
