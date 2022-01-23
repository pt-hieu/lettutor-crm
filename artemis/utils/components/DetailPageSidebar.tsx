import { scroller } from 'react-scroll'

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
  const scrollToSection = (value: string) => {
    scroller.scrollTo(value, {
      duration: 1000,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -150,
    })
  }
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
                className="p-2 text-sm rounded-md hover:bg-gray-100 hover:cursor-pointer"
                key={label}
                onClick={() => scrollToSection(label)}
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
