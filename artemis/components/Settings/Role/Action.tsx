type Props = {
  data: string
  disabled?: boolean
}

export default function Action({ data, disabled }: Props) {
  return (
    <div className="flex gap-2 items-center">
      <input disabled={disabled} type="checkbox" className="crm-input" />
      <div className="w-full p-2 border rounded-md">{data}</div>
    </div>
  )
}
