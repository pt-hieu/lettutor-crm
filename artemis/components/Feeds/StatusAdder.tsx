import { useState } from 'react'

import { useTypedSession } from '@utils/hooks/useTypedSession'
import { getAvatarLinkByName } from '@utils/libs/avatar'

import { FeedTextbox, IFeedTextboxData } from './FeedTextbox'

interface IStatusAdderProps {}

export const StatusAdder = ({}: IStatusAdderProps) => {
  const [isActive, setIsActive] = useState(false)

  const handlePostStatus = (data: IFeedTextboxData) => {
    console.log(data)
  }
  const [session] = useTypedSession()

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
            isLoading={false}
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
