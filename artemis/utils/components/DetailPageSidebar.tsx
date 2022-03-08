import { MouseEventHandler, ReactNode, useCallback } from 'react'

import Tooltip from './Tooltip'

export type SidebarStructure = {
  title: string
  options: ({
    extend?: {
      onClick: MouseEventHandler
      title: string
      icon?: string
    }
  } & ({ label: string; id?: never } | { label: ReactNode; id: string }))[]
}[]

type Props = {
  data: SidebarStructure
}

const DetailPageSidebar = ({ data }: Props) => {
  const scrollToSection = useCallback((value: string) => {
    const element = document.getElementById(value)
    const y =
      (element?.getBoundingClientRect().top || 0) + window.pageYOffset - 150

    window.scrollTo({ top: y, behavior: 'smooth' })
  }, [])

  return (
    <div className="fixed top-[165px] w-[250px]">
      {data.map((data, index) => (
        <div key={data.title} className="mb-10">
          <div className="px-2 font-semibold text-[17px] mb-3">
            {data.title}
          </div>
          <ul className="flex flex-col gap-2">
            {data.options.map(({ label, extend, id }) => (
              <li
                className="p-2 text-sm rounded-md hover:bg-gray-100 crm-transition hover:cursor-pointer flex justify-between group"
                // @ts-ignore
                key={id || label}
                // @ts-ignore
                onClick={() => scrollToSection(id || label)}
              >
                <div>{label}</div>
                <div className="opacity-0 group-hover:opacity-100 crm-transition">
                  {extend && (
                    <Tooltip title={extend.title}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          extend.onClick(e)
                        }}
                      >
                        <span className={`fa ${extend.icon || 'fa-plus'}`} />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DetailPageSidebar
