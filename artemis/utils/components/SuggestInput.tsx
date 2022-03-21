import { debounce } from 'lodash'
import {
  ChangeEvent,
  Key,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react'

import { useModal } from '@utils/hooks/useModal'

import Animate from './Animate'
import Input, { InputProps } from './Input'
import Menu from './Menu'

type TProps<T> = {
  inputProps: Omit<InputProps, 'type' | 'onChange' | 'onFocus' | 'onBlur'>
  getData: () => T[]
  render: (v: T) => ReactNode
  getKey: (v: T) => Key
  filter: (v: T, query: string) => boolean
  onItemSelect: (v: T) => any
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

export default function SuggestInput<T = unknown>({
  getData,
  onItemSelect: selectItem,
  filter,
  getKey,
  render,
  error,
  showError,
}: TProps<T>) {
  const [data] = useState(getData)
  const [value, setValue] = useState<string>('')

  const changeValue = useCallback(
    debounce((v: string) => {
      setValue(v)
    }, 500),
    [],
  )

  const filteredData = useMemo<T[]>(() => {
    return data.filter((item) => filter(item, value))
  }, [value, data])

  const [popup, open, close] = useModal()

  return (
    <div className="relative">
      {/* @ts-ignore */}
      <Input
        as="input"
        showError={showError}
        error={error}
        props={{
          type: 'text',
          onChange(e: ChangeEvent<HTMLInputElement>) {
            changeValue(e.target.value)
          },
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
          end: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
        }}
        className="absolute right-0 bottom-[-10%] translate-y-full"
      >
        <Menu
          items={filteredData.map((item) => ({
            key: getKey(item),
            action: selectItem(item),
            title: render(item),
          }))}
        />
      </Animate>
    </div>
  )
}
