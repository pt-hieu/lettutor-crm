import { List } from 'antd'
import Link from 'next/link'

import { DealStageModal } from '@components/Deals/DealStageMapping/DealStageModal'
import SettingsLayout from '@components/Settings/SettingsLayout'

import Dropdown from '@utils/components/Dropdown'
import Menu from '@utils/components/Menu'
import { useModal } from '@utils/hooks/useModal'

type ModulesList = {
  name: string
  link: string
  options: {
    option: string
    handleClick: () => void
  }[]
}[]

const ModulesSettings = () => {
  const [showStageMappingModal, openModal, closeModal] = useModal()

  const modulesList: ModulesList = [
    {
      name: 'Lead',
      options: [],
      link: '/settings/modules/leads',
    },
    {
      name: 'Contact',
      link: '/settings/modules/contacts',
      options: [],
    },
    {
      name: 'Account',
      link: '/settings/modules/accounts',
      options: [],
    },
    {
      name: 'Deal',
      link: '/settings/modules/deals',
      options: [
        {
          option: 'Stage-Probability Mapping',
          handleClick: openModal,
        },
      ],
    },
  ]

  return (
    <SettingsLayout title="CRM | Modules and Fields">
      <DealStageModal
        visible={showStageMappingModal}
        handleClose={closeModal}
        isLoading={false}
      />

      <List
        size="large"
        header={<h2 className="text-lg font-medium">Modules</h2>}
        itemLayout="horizontal"
        dataSource={modulesList}
        renderItem={(item, index) => (
          <List.Item
            actions={[
              <Dropdown
                key={'dropdown' + index}
                triggerOnHover={false}
                overlay={
                  item.options.length ? (
                    <Menu
                      className="min-w-[250px]"
                      items={item.options.map((option) => ({
                        key: option.option,
                        title: option.option,
                        action: option.handleClick,
                      }))}
                    />
                  ) : (
                    <div></div>
                  )
                }
              >
                <button className="crm-button-icon w-8 aspect-square rounded-full hover:bg-gray-200">
                  <span className="fa fa-ellipsis-v" />
                </button>
              </Dropdown>,
            ]}
          >
            <Link href={item.link}>
              <a>{item.name}</a>
            </Link>
          </List.Item>
        )}
      />
    </SettingsLayout>
  )
}

export default ModulesSettings
