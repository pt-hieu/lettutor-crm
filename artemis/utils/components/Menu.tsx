import { MouseEventHandler, ReactNode, useCallback } from 'react'

type Item = {
  key: string
  title: string | ReactNode
  action: MouseEventHandler
}

type Props = {
  className?: string
  stopPropagationOnClick?: boolean
  items: Item[]
}

export default function Menu({
  items,
  className,
  stopPropagationOnClick,
}: Props) {
  const handleContainerClick = useCallback<MouseEventHandler>(
    (e) => {
      if (stopPropagationOnClick) e.stopPropagation()
    },
    [stopPropagationOnClick],
  )

  return (
    <div
      onClick={handleContainerClick}
      className={`py-2 border rounded-md bg-white ${className || ''}`}
    >
      {items.map(({ key, action, title }) => (
        <button
          className="px-5 py-2 font-semibold text-sm text-gray-700 hover:bg-gray-200 w-full"
          onClick={action}
          key={key}
        >
          {title}
        </button>
      ))}
    </div>
  )
}
