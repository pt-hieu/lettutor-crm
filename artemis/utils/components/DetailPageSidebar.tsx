import { scroller } from 'react-scroll'
import { Menu, Dropdown } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { useState } from 'react'

export type SidebarChoice = {
  label: string
  onClick: () => void
}

export type SidebarStructure = {
  title: string
  options: {
    label: string
    choices?: SidebarChoice[]
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

  const [currentHoveredSection, setCurrentHoveredSection] = useState<number>(-1)

  return (
    <div className="fixed top-[165px] w-[250px]">
      {data.map((data) => (
        <div key={data.title} className="mb-10">
          <div className="px-2 font-semibold text-[17px] mb-3">
            {data.title}
          </div>
          <ul className="flex flex-col gap-2">
            {data.options.map(({ label, choices }, index) => (
              <li
                className="p-2 text-sm rounded-md hover:bg-gray-100 hover:cursor-pointer flex justify-between"
                key={label}
                onClick={() => scrollToSection(label)}
                onMouseOver={() => setCurrentHoveredSection(index)}
              >
                <div>{label}</div>
                <div
                  className={`${
                    currentHoveredSection === index ? 'visible' : 'invisible'
                  }`}
                >
                  {choices && (
                    <Dropdown
                      arrow
                      trigger={['click']}
                      overlay={
                        <Menu>
                          {choices.map(({ label, onClick }) => (
                            <Menu.Item key={label}>
                              <a onClick={onClick}>{label}</a>
                            </Menu.Item>
                          ))}
                        </Menu>
                      }
                    >
                      <a
                        className="ant-dropdown-link"
                        onClick={(e) => e.preventDefault()}
                      >
                        <DownOutlined />
                      </a>
                    </Dropdown>
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
