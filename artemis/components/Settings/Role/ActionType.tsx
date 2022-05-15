type Props = {
  data: string
  disabled?: boolean
}

export default function ActionType({ data, disabled }: Props) {
  return (
    <div className="flex gap-2 items-center bg-white">
      <input disabled={disabled} type="checkbox" className="crm-input" />
      <div className="w-full p-2 border rounded-md">{data}</div>
    </div>
  )
}
