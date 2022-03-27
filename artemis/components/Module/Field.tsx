import { ReactNode, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

import Input from '@utils/components/Input'
import SuggestInput from '@utils/components/SuggestInput'
import { useStore } from '@utils/hooks/useStore'
import { FieldMeta, FieldType } from '@utils/models/module'

import { toCapitalizedWords } from './OverviewView'

type FieldProps = {
  data: FieldMeta
}

const EmailReg =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const PhoneReg = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/

export default function Field({ data }: FieldProps) {
  const { name, required, type, options, relateTo, validation } = data
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext()

  const { data: relationItems } = useStore<any[]>(['relation-data', relateTo])
  const registration = useMemo(
    () =>
      register(name, {
        required: required
          ? `${toCapitalizedWords(name.replace('Id', ''))} is required`
          : undefined,
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
      }),
    [],
  )

  const renderField = useMemo<Record<FieldType, ReactNode>>(
    () => ({
      [FieldType.TEXT]: (
        <Input
          error={errors[name]?.message}
          props={{
            type: 'text',
            id: name,
            className: 'w-full',
            ...registration,
          }}
        />
      ),
      [FieldType.EMAIL]: (
        <Input
          error={errors[name]?.message}
          props={{
            type: 'email',
            id: name,
            className: 'w-full',
            ...registration,
          }}
        />
      ),
      [FieldType.MULTILINE_TEXT]: (
        <Input
          error={errors[name]?.message}
          as="textarea"
          props={{
            id: name,
            className: 'w-full',
            ...registration,
          }}
        />
      ),
      [FieldType.NUMBER]: (
        <Input
          error={errors[name]?.message}
          props={{
            type: 'number',
            id: name,
            className: 'w-full',
            ...registration,
          }}
        />
      ),
      [FieldType.PHONE]: (
        <Input
          error={errors[name]?.message}
          props={{
            type: 'tel',
            id: name,
            className: 'w-full',
            ...registration,
          }}
        />
      ),
      [FieldType.RELATION]: (
        <SuggestInput
          error={errors[name]?.message}
          onItemSelect={(item) => setValue(name, item.id)}
          getData={relationItems || []}
          filter={(item, query) =>
            item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
          }
          mapValue={(v, items) => items?.find((item) => item.id === v)?.name}
          getKey={(item) => item.id}
          render={(item) => <span>{item.name}</span>}
          inputProps={{
            className: 'w-full',
            id: name,
            ...registration,
          }}
        />
      ),
      [FieldType.SELECT]: (
        <SuggestInput
          error={errors[name]?.message}
          onItemSelect={(item) => setValue(name, item)}
          getData={options || []}
          filter={(item, query) =>
            item.toLocaleLowerCase().includes(query.toLocaleLowerCase())
          }
          getKey={(item) => item}
          render={(item) => <span>{item}</span>}
          inputProps={{
            className: 'w-full',
            id: name,
            ...registration,
          }}
        />
      ),
    }),
    [relationItems, data, errors[name]?.message, registration],
  )

  return (
    <div className="grid grid-cols-[1fr,2fr] mb-6 gap-6">
      <label
        htmlFor={name}
        className={`mt-[10px] crm-label text-right ${
          required ? '' : "after:content-['']"
        }`}
      >
        {toCapitalizedWords(name.replace('Id', ''))}
      </label>

      <div>{renderField[type]}</div>
    </div>
  )
}
