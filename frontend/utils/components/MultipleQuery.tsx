import Input from '@utils/components/Input'
import { Fragment } from 'react'
import { useForm, useFormContext } from 'react-hook-form'

type Props = {
  type: 'checkbox' | 'radio'
  options: Array<string | number>
  name: string
}

export default function MultipleQuery({ options, type, name }: Props) {
  const { register } = useFormContext()

  return (
    <div className="flex flex-col gap-2">
      {options.map((value) => (
        <div className="flex gap-2 items-start" key={value}>
          <Input
            showError={false}
            as="input"
            props={{
              type,
              value,
              ...register(name),
              id: value + name,
            }}
          />
          <label
            htmlFor={value + name}
            className="crm-label mb-0 after:content-['']"
          >
            {value}
          </label>
        </div>
      ))}
    </div>
  )
}
