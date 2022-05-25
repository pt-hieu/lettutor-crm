import { useState } from 'react'

import Input from '@utils/components/Input'

import { FeedTextbox, IFeedTextboxData } from './FeedTextbox'

interface IStatusAdderProps {}

export const StatusAdder = ({}: IStatusAdderProps) => {
  const [isActive, setIsActive] = useState(false)

  const handlePostStatus = (data: IFeedTextboxData) => {
    console.log(data)
  }

  const placeholder = "Hey! What's up?"

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
            submitText="Post"
          />
        ) : (
          <Input
            as="input"
            props={{
              placeholder,
              type: 'text',
              className: 'w-full pb-[20px] border-red-900',
              onFocus: () => setIsActive(true),
            }}
            showError={false}
          />
        )}
      </div>
    </div>
  )
}
