import { useEffect, useRef, useState } from 'react'
import { UseFormReset } from 'react-hook-form'
import { useClickAway } from 'react-use'

import Animate from './Animate'
import Input, { Props as InputProps } from './Input'

type Props<T> = {
  onEditComplete: (e: any) => void
  onEditCancel: UseFormReset<any>
} & Omit<InputProps<T>, 'editable'>

const buttonClasses = 'w-10 h-10 grid place-content-center'

export default function InlineEdit<
  T extends 'select' | 'input' | 'textarea' | undefined,
>({ onEditComplete: submit, onEditCancel: cancel, ...inputProps }: Props<T>) {
  const [enabled, setEnabled] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useClickAway(containerRef, () => {
    setEnabled(false)
    cancel()
  })

  useEffect(() => {
    if (!enabled) return
    document.getElementById(inputProps.props.id || '')?.focus()
  }, [enabled])

  const [left, setLeft] = useState<string>()
  useEffect(() => {
    const element = document.getElementById(inputProps.props.id || '')
    if (!element) return

    element.style.minWidth =
      (element as HTMLInputElement).value.length - 12 + 'ch'
    setLeft(8 + (element.offsetWidth || 0) + 'px')
  }, [inputProps.props.value])

  return (
    <div ref={containerRef} className="flex gap-2 relative group">
      {/* @ts-ignore */}
      <Input
        editable={enabled}
        {...inputProps}
        props={{
          ...inputProps.props,
          placeholder: enabled ? undefined : '______',
        }}
        showError={enabled}
      />

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
