import { Key, MouseEventHandler, ReactNode, useCallback } from 'react'

type Item = {
  key: Key
  title: string | ReactNode
  action: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}

type Props = {
  className?: string
  stopPropagationOnClick?: boolean
  items: (Item | undefined)[]
  itemClassName?: string
  notFoundMessage?: string
}

export default function Menu({
  items,
  className,
  stopPropagationOnClick,
  itemClassName,
  notFoundMessage,
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
      {(items.filter((x) => !!x) as Item[]).map(
        ({ key, action, title, disabled }) => (
          <button
            type="button"
            className={`px-5 py-2 font-semibold text-sm text-gray-700 w-full ${
              itemClassName || ''
            } ${disabled ? 'opacity-50' : 'hover:bg-gray-200'}`}
            onClick={action}
            key={key}
            disabled={disabled}
          >
            {title}
          </button>
        ),
      )}

      {!items.length && (
        <div
          className={`px-5 py-2 font-semibold text-sm text-gray-400 cursor-default w-full ${
            itemClassName || ''
          }`}
        >
          {'Found nothing' || notFoundMessage}
        </div>
      )}
    </div>
  )
}
