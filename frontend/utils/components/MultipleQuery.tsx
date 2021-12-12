import Input from '@utils/components/Input'
import { useFormContext } from 'react-hook-form'

type Props = {
  type: 'checkbox' | 'radio'
  options: Array<string | number>
  name: string
}

const reg = /[-\/]/g

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
              id: (value + name).replaceAll(reg, ' '),
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
