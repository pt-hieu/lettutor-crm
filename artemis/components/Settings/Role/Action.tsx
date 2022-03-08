import { ActionValues } from '@utils/models/role'

type Props = {
  data: ActionValues
  disabled?: boolean
}

export default function Action({ data, disabled }: Props) {
  return (
    <div className="flex gap-2 items-center bg-white">
      <input disabled={disabled} type="checkbox" className="crm-input" />
      <div className="w-full p-2 border rounded-md">{data}</div>
    </div>
  )
}
