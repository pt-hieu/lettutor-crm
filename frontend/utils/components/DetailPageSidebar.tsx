import { Fragment } from 'react'

export type SidebarStructure = {
  title: string
  options: {
    label: string
  }[]
}[]

type Props = {
  data: SidebarStructure
}

const DetailPageSidebar = ({ data }: Props) => {
  return (
    <div>
      {data.map((data) => (
        <div key={data.title} className="mb-10">
          <div className="px-2 font-semibold text-[17px] mb-3">
            {data.title}
          </div>
          <ul className="flex flex-col gap-2">
            {data.options.map(({ label }) => (
              <li
                className="p-2 text-sm rounded-md hover:bg-gray-100"
                key={label}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DetailPageSidebar
