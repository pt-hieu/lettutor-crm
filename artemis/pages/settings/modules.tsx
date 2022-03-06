import SettingsLayout from '@components/Settings/SettingsLayout'
import { List, Menu, Dropdown } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { DealStageModal } from '@components/Deals/DealStageMapping/DealStageModal'

type ModulesList = {
  name: string
  options: {
    option: string
    handleClick: () => void
  }[]
}[]

const ModulesSettings = () => {
  const [showStageMappingModal, setShowStageMappingModal] = useState(false)

  const modulesList: ModulesList = [
    {
      name: 'Lead',
      options: [],
    },
    {
      name: 'Contact',
      options: [],
    },
    {
      name: 'Account',
      options: [],
    },
    {
      name: 'Deal',
      options: [
        {
          option: 'Stage-Probability Mapping',
          handleClick: () => setShowStageMappingModal(true),
        },
      ],
    },
  ]

  return (
    <SettingsLayout title="CRM | Modules and Fields">
      <DealStageModal
        visible={showStageMappingModal}
        handleClose={() => setShowStageMappingModal(false)}
        isLoading={false}
      />
      <div>
        <List
          size="large"
          header={<h2 className="text-lg font-medium">Modules</h2>}
          itemLayout="horizontal"
          dataSource={modulesList}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Dropdown
                  arrow
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {item.options.map(({ option, handleClick }, index) => (
                        <Menu.Item key={index}>
                          <a onClick={handleClick}>{option}</a>
                        </Menu.Item>
                      ))}
                    </Menu>
                  }
                >
                  <a
                    className="ant-dropdown-link"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </a>
                </Dropdown>,
              ]}
            >
              <div>{item.name}</div>
            </List.Item>
          )}
        />
      </div>
    </SettingsLayout>
  )
}

export default ModulesSettings
