import {
  ChangeEventHandler,
  Key,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { unstable_batchedUpdates } from 'react-dom'

import { useModal } from '@utils/hooks/useModal'

import Animate from './Animate'
import Input, { InputProps } from './Input'
import Menu from './Menu'

type TProps<T> = {
  inputProps: Omit<InputProps, 'hidden'>
  getData: T[] | (() => T[])
  render: (v: T) => ReactNode
  getKey: (v: T) => Key
  filter: (v: T, query: string) => boolean
  onItemSelect: (v: T) => any
  mapValue?: (v: string, data: T[]) => string
} & (
  | {
      showError?: true
      error: string | undefined
    }
  | {
      showError: false
      error?: never
    }
)

export default function SuggestInput<T>({
  getData,
  onItemSelect: selectItem,
  filter,
  getKey,
  render,
  error,
  inputProps,
  showError,
  mapValue,
}: TProps<T>) {
  const [data, setData] = useState(getData)
  const [value, setValue] = useState<string>('')
  const [displayValue, setDisplayValue] = useState<string>('')

  useEffect(() => {
    setData(getData)
  }, [getData])

  const filteredData = useMemo<T[]>(() => {
    return data.filter((item) => filter(item, value.toLocaleLowerCase()))
  }, [value, data])

  const [popup, open, close] = useModal()

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const value = e.target.value
      unstable_batchedUpdates(() => {
        setValue(value)
        setDisplayValue(value)
      })
    },
    [],
  )

  const hookedSelectItem = useCallback(
    (item: T) => () => {
      selectItem(item)

      const value = (
        document.getElementById(
          inputProps.name + 'hidden' || '',
        ) as HTMLInputElement
      )?.value

      const mappedValue = mapValue ? mapValue(value, data) : value
      setDisplayValue(mappedValue)
    },
    [data],
  )

  useEffect(() => {
    const value = (
      document.getElementById(
        inputProps.name + 'hidden' || '',
      ) as HTMLInputElement
    )?.value

    const mappedValue = mapValue ? mapValue(value, data) : value
    setDisplayValue(mappedValue)
  }, [data])

  return (
    <div className="relative w-full">
      <input type="hidden" {...inputProps} id={inputProps.name + 'hidden'} />

      {/* @ts-ignore */}
      <Input
        as="input"
        showError={showError}
        error={error}
        props={{
          type: 'text',
          id: inputProps.name,
          value: displayValue,
          className: inputProps.className,
          onChange: handleInputChange,
          onFocus() {
            open()
          },
          onBlur() {
            close()
          },
        }}
      />

      <Animate
        on={popup}
        shouldAnimateOnExit
        animation={{
          start: { opacity: 0, y: -10 },
          end: { opacity: 0 },
          animate: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.1, ease: 'linear' }}
        className="absolute right-0 bottom-[-8px] w-full z-[10001]"
      >
        <Menu
          itemClassName="text-left"
          className="translate-y-full shadow-sm"
          items={filteredData.map((item) => ({
            key: getKey(item),
            action: hookedSelectItem(item),
            title: render(item),
          }))}
        />
      </Animate>
    </div>
  )
}
