import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useClickAway } from 'react-use'

import Animate from '@utils/components/Animate'
import Input from '@utils/components/Input'
import SuggestInput from '@utils/components/SuggestInput'
import { EmailReg, PhoneReg } from '@utils/data/regex'
import { useModal } from '@utils/hooks/useModal'
import { useStore } from '@utils/hooks/useStore'
import { FieldMeta, FieldType } from '@utils/models/module'

import { toCapitalizedWords } from './OverviewView'

type FieldProps = {
  data: FieldMeta
  inlineEdit?: boolean
  containerClassname?: string
  registerName?: string
  hideControl?: boolean
}

function index(obj: Record<any, any>, notation: string) {
  return notation.split('.').reduce((res, curr) => res?.[curr], { ...obj })
}

export default function Field({
  data,
  inlineEdit,
  containerClassname,
  registerName,
  hideControl,
}: FieldProps) {
  const {
    name,
    required,
    type,
    options,
    relateTo,
    min,
    max,
    minLength,
    maxLength,
  } = data
  const {
    register,
    setValue,
    formState: { errors },
    resetField,
  } = useFormContext()

  const [isEnable, enable, disable] = useModal()
  const [left, setLeft] = useState<string>()

  useEffect(() => {
    if (!inlineEdit) return

    const element = document.getElementById(name)
    if (!element) return

    if (type === FieldType.CHECK_BOX) {
      setLeft(240 + element.offsetWidth + 'px')
      return
    }

    const valueLength = (element as HTMLInputElement).value.length
    element.style.minWidth = Math.min(Math.max(valueLength, 40), 60) + 'ch'

    setLeft(230 + (element.offsetWidth || 0) + 'px')
  }, [])

  const { data: relationItems } = useStore<any[]>(['relation-data', relateTo])

  const registration = register(registerName || name, {
    required: required
      ? `${toCapitalizedWords(name.replace('Id', ''))} is required`
      : undefined,
    ...(max && {
      max: {
        value: max,
        message: `${toCapitalizedWords(name)} must not be greater than ${max}.`,
      },
    }),
    ...(minLength && {
      minLength: {
        value: minLength,
        message: `${toCapitalizedWords(
          name,
        )} must be longer than ${minLength}.`,
      },
    }),
    ...(maxLength && {
      maxLength: {
        value: maxLength,
        message: `${toCapitalizedWords(
          name,
        )} must be shorter than ${maxLength}.`,
      },
    }),
    ...(min && {
      min: {
        value: min,
        message: `${toCapitalizedWords(name)} must be greater than ${min}.`,
      },
    }),
    ...(type === FieldType.EMAIL && {
      pattern: {
        value: EmailReg,
        message: `${toCapitalizedWords(name)} is not valid`,
      },
    }),
    ...(type === FieldType.PHONE && {
      pattern: {
        value: PhoneReg,
        message: `${toCapitalizedWords(name)} is not valid`,
      },
    }),
  })

  const renderField = {
    [FieldType.TEXT]: (
      <Input
        error={index(errors, registerName || name)?.message}
        editable={!inlineEdit || isEnable}
        props={{
          type: 'text',
          id: name,
          className: inlineEdit ? 'w-[fit-content]' : 'w-full',
          disabled: inlineEdit && !isEnable,
          ...registration,
        }}
      />
    ),
    [FieldType.EMAIL]: (
      <Input
        error={index(errors, registerName || name)?.message}
        editable={!inlineEdit || isEnable}
        props={{
          type: 'email',
          id: name,
          className: inlineEdit ? 'w-[fit-content]' : 'w-full',
          disabled: inlineEdit && !isEnable,
          ...registration,
        }}
      />
    ),
    [FieldType.MULTILINE_TEXT]: (
      <Input
        error={index(errors, registerName || name)?.message}
        editable={!inlineEdit || isEnable}
        as="textarea"
        props={{
          id: name,
          className: inlineEdit ? 'w-[fit-content]' : 'w-full',
          disabled: inlineEdit && !isEnable,
          ...registration,
        }}
      />
    ),
    [FieldType.NUMBER]: (
      <Input
        error={index(errors, registerName || name)?.message}
        editable={!inlineEdit || isEnable}
        props={{
          type: 'number',
          id: name,
          className: inlineEdit ? 'w-[fit-content]' : 'w-full',
          disabled: inlineEdit && !isEnable,
          ...registration,
        }}
      />
    ),
    [FieldType.PHONE]: (
      <Input
        error={index(errors, registerName || name)?.message}
        editable={!inlineEdit || isEnable}
        props={{
          type: 'tel',
          id: name,
          className: inlineEdit ? 'w-[fit-content]' : 'w-full',
          disabled: inlineEdit && !isEnable,
          ...registration,
        }}
      />
    ),
    [FieldType.RELATION]: (
      <SuggestInput
        wrapperClassname={inlineEdit ? '' : '!w-full'}
        error={index(errors, registerName || name)?.message}
        onItemSelect={(item) => setValue(registerName || name, item.id)}
        getData={relationItems || []}
        filter={(item, query) =>
          item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
        }
        mapValue={(v, items) => {
          const item = items?.find?.((item) => item.id === v)
          return item?.name
        }}
        getKey={(item) => item.id}
        render={(item) => <span>{item.name}</span>}
        inputProps={{
          className: inlineEdit ? 'w-[fit-content]' : 'w-full',
          id: name,
          disabled: inlineEdit && !isEnable,
          ...registration,
        }}
      />
    ),
    [FieldType.SELECT]: (
      <SuggestInput
        wrapperClassname={inlineEdit ? '' : '!w-full'}
        error={index(errors, registerName || name)?.message}
        onItemSelect={(item) => setValue(registerName || name, item)}
        getData={options || []}
        filter={(item, query) =>
          item.toLocaleLowerCase().includes(query.toLocaleLowerCase())
        }
        getKey={(item) => item}
        render={(item) => <span>{item}</span>}
        mapValue={(v) => v}
        inputProps={{
          className: inlineEdit ? 'w-[fit-content]' : 'w-full',
          id: name,
          disabled: inlineEdit && !isEnable,
          ...registration,
        }}
      />
    ),
    [FieldType.DATE]: (
      <Input
        error={index(errors, registerName || name)?.message}
        editable={!inlineEdit || isEnable}
        props={{
          type: 'date',
          id: name,
          className: inlineEdit ? 'w-[fit-content]' : 'w-full',
          disabled: inlineEdit && !isEnable,
          ...registration,
        }}
      />
    ),
    [FieldType.CHECK_BOX]: (
      <Input
        error={index(errors, registerName || name)?.message}
        editable={!inlineEdit || isEnable}
        props={{
          id: name,
          className: `rounded-lg w-[24px] h-[24px] ${inlineEdit ? 'mx-2' : ''}`,
          disabled: inlineEdit && !isEnable,
          type: 'checkbox',
          ...registration,
        }}
      />
    ),
  }

  const containerRef = useRef<HTMLDivElement>(null)

  useClickAway(containerRef, () => {
    if (!inlineEdit) return
    disable()
    resetField(name)
  })

  return (
    <div
      ref={containerRef}
      className={`grid ${
        inlineEdit
          ? 'grid-cols-[200px,1fr] relative group'
          : 'grid-cols-[1fr,3fr]'
      } mb-6 gap-6 ${containerClassname || ''}`}
    >
      <label
        htmlFor={name}
        className={`mt-[10px] crm-label ${
          required && !inlineEdit ? '' : "after:content-['']"
        } `}
      >
        {toCapitalizedWords(name.replace('Id', ''))}
      </label>

      <div>{renderField[type]}</div>

      {inlineEdit && (
        <>
          <Animate
            shouldAnimateOnExit
            on={isEnable}
            className="overflow-y-hidden absolute"
            style={{ left }}
            transition={{ duration: 0.2 }}
            animation={{
              start: {
                opacity: 0,
                y: -20,
              },
              animate: {
                opacity: 1,
                y: 0,
              },
              end: {
                opacity: 0,
                y: 20,
              },
            }}
          >
            <div
              className={`flex gap-2 ${
                isEnable ? 'opacity-100' : 'opacity-0'
              } group-hover:opacity-100 crm-transition`}
            >
              <button
                type="submit"
                onClick={(e) => {
                  // submit && submit(e)
                  errors[name] || disable()
                }}
                className={' crm-button'}
              >
                <span className="fa fa-check" />
              </button>

              <button
                type="button"
                onClick={() => {
                  disable()
                  resetField(name)
                }}
                className={' crm-button-outline'}
              >
                <span className="fa fa-times" />
              </button>
            </div>
          </Animate>

          <Animate
            shouldAnimateOnExit
            style={{ left }}
            on={!isEnable}
            className="overflow-y-hidden absolute"
            transition={{ duration: 0.2 }}
            animation={{
              start: {
                opacity: 0,
                y: -20,
              },
              animate: {
                opacity: 1,
                y: 0,
              },
              end: {
                opacity: 0,
                y: 20,
              },
            }}
          >
            <div
              className={`flex gap-2 invisible ${
                !hideControl ? 'group-hover:visible' : ''
              } crm-transition`}
            >
              <button
                onClick={enable}
                type="button"
                className={' crm-button-outline border-none'}
              >
                <span className="fa fa-edit" />
              </button>
            </div>
          </Animate>
        </>
      )}
    </div>
  )
}
