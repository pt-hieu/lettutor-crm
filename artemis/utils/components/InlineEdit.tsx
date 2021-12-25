import Input, { Props as InputProps } from './Input'
import { useEffect, useState } from 'react'
import Animate from './Animate'
import { useQuery, useQueryClient } from 'react-query'
import moment from 'moment'
import { UseFormReset } from 'react-hook-form'
import { GlobalState } from '@utils/GlobalStateKey'

type Props<T> = {
  onEditComplete: (e: any) => void
  onEditCancel: UseFormReset<any>
} & Omit<InputProps<T>, 'editable'>

const buttonClasses = 'w-10 h-10 grid place-content-center'

export default function InlineEdit<
  T extends 'select' | 'input' | 'textarea' | undefined,
>({ onEditComplete: submit, onEditCancel: cancel, ...inputProps }: Props<T>) {
  const [enabled, setEnabled] = useState(false)
  const client = useQueryClient()

  const [time, setTime] = useState<Date>(new Date())
  const { data: globalTime } = useQuery<Date>(GlobalState.InlineEdit, {
    enabled: false,
  })

  useEffect(() => {
    if (moment(time).isBefore(globalTime)) {
      setEnabled(false)
      cancel()
    }
  }, [globalTime])

  useEffect(() => {
    if (!enabled) return
    document.getElementById(inputProps.props.id || '')?.focus()

    const now = new Date()
    setTime(now)
    client.setQueryData(GlobalState.InlineEdit, now)
  }, [enabled])

  const [left, setLeft] = useState<string>()
  useEffect(() => {
    const element = document.getElementById(inputProps.props.id || '')
    setLeft(8 + (element?.offsetWidth || 0) + 'px')
  }, [])

  return (
    <div className="flex gap-2 relative group">
      {/* @ts-ignore */}
      <Input editable={enabled} {...inputProps} showError={enabled} />

      <Animate
        shouldAnimateOnExit
        on={enabled}
        className="overflow-y-hidden absolute"
        style={{ left }}
        transition={{ duration: 0.2 }}
        animation={{
          start: {
            opacity: 0,
            transform: `translateY(-20px)`,
          },
          animate: {
            opacity: 1,
            transform: 'translateY(0px)',
          },
          end: {
            opacity: 0,
            transform: `translateY(20px)`,
          },
        }}
      >
        <div
          className={`flex gap-2 ${
            enabled ? 'opacity-100' : 'opacity-0'
          } group-hover:opacity-100 crm-transition`}
        >
          <button
            type="submit"
            onClick={(e) => {
              submit && submit(e)
              inputProps.error || setEnabled(false)
            }}
            className={buttonClasses + ' crm-button'}
          >
            <span className="fa fa-check" />
          </button>

          <button
            type="button"
            onClick={() => {
              setEnabled(false)
              cancel()
            }}
            className={buttonClasses + ' crm-button-outline'}
          >
            <span className="fa fa-times" />
          </button>
        </div>
      </Animate>

      <Animate
        shouldAnimateOnExit
        style={{ left }}
        on={!enabled}
        className="overflow-y-hidden absolute"
        transition={{ duration: 0.2 }}
        animation={{
          start: {
            opacity: 0,
            transform: `translateY(-20px)`,
          },
          animate: {
            opacity: 1,
            transform: 'translateY(0px)',
          },
          end: {
            opacity: 0,
            transform: `translateY(20px)`,
          },
        }}
      >
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 crm-transition">
          <button
            onClick={() => setEnabled(true)}
            type="button"
            className={buttonClasses + ' crm-button-outline border-none'}
          >
            <span className="fa fa-edit" />
          </button>
        </div>
      </Animate>
    </div>
  )
}
