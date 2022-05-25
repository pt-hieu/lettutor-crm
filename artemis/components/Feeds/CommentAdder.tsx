import { useState } from 'react'

import { FeedTextbox, IFeedTextboxData } from './FeedTextbox'

interface IStatusAdderProps {}

export const CommentAdder = ({}: IStatusAdderProps) => {
  const [isActive, setIsActive] = useState(false)

  const handlePostStatus = (data: IFeedTextboxData) => {
    console.log(data)
  }

  const placeholder = 'Write a comment.'

  const prefix = (
    <i className="fa fa-comments text-[17px] text-gray-500 m-1 mt-2" />
  )

  return (
    <div className="flex gap-2">
      <div className="w-[44px]">
        <div className="w-10 h-10 rounded-full bg-blue-300 text-center text-white leading-10">
          avt
        </div>
      </div>
      <div className="flex-1">
        {isActive ? (
          <FeedTextbox
            onCancel={() => setIsActive(false)}
            onSubmit={handlePostStatus}
            isLoading={false}
            placeholder={placeholder}
            prefix={prefix}
            maxContent={250}
          />
        ) : (
          <div
            className="border rounded-xl px-2 pt-1 pb-3 hover:border-blue-500 text-gray-500 flex items-center cursor-text"
            onClick={() => setIsActive(true)}
          >
            {prefix}
            <div className="p-2 pt-3">{placeholder}</div>
          </div>
        )}
      </div>
    </div>
  )
}
