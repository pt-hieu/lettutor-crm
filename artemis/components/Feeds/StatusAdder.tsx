import { notification } from 'antd'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'

import { useTypedSession } from '@utils/hooks/useTypedSession'
import { getAvatarLinkByName } from '@utils/libs/avatar'
import { AddStatusDto } from '@utils/models/feed'
import { addStatus } from '@utils/service/feed'

import { FeedTextbox, IFeedTextboxData } from './FeedTextbox'

interface IStatusAdderProps {}

export const StatusAdder = ({}: IStatusAdderProps) => {
  const [isActive, setIsActive] = useState(false)

  const [session] = useTypedSession()

  const client = useQueryClient()

  const { mutateAsync: addStatusService, isLoading } = useMutation(
    'add-status',
    addStatus,
    {
      onSuccess() {
        client.refetchQueries(['feeds'])
        setIsActive(false)
      },
      onError() {
        notification.error({ message: 'Add status unsuccessfully' })
      },
    },
  )

  const handlePostStatus = (data: IFeedTextboxData) => {
    const newData: AddStatusDto = {
      ...data,
      ownerId: session?.user.id as string,
    }
    addStatusService(newData)
  }

  const placeholder = "Hey! What's up?"

  return (
    <div className="flex gap-2">
      <div className="w-[44px]">
        <img
          className="w-10 h-10 rounded-full"
          alt="Avatar"
          src={getAvatarLinkByName(session?.user.name || '')}
        />
      </div>
      <div className="flex-1">
        {isActive ? (
          <FeedTextbox
            onCancel={() => setIsActive(false)}
            onSubmit={handlePostStatus}
            isLoading={isLoading}
            placeholder={placeholder}
            submitText="Post"
          />
        ) : (
          <div
            className="border rounded-md px-2 pb-5 hover:border-blue-500 text-gray-500 flex items-center cursor-text"
            onClick={() => setIsActive(true)}
          >
            <div className="p-2">{placeholder}</div>
          </div>
        )}
      </div>
    </div>
  )
}
