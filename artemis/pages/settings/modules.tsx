import { List } from 'antd'
import { GetServerSideProps } from 'next'
import { QueryClient, dehydrate } from 'react-query'

import { DealStageModal } from '@components/Deals/DealStageMapping/DealStageModal'
import SettingsLayout from '@components/Settings/SettingsLayout'

import Dropdown from '@utils/components/Dropdown'
import Menu from '@utils/components/Menu'
import { useModal } from '@utils/hooks/useModal'
import { getSessionToken } from '@utils/libs/getToken'
import { getDealStages } from '@utils/service/deal'

type ModulesList = {
  name: string
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
            <div>{item.name}</div>
          </List.Item>
        )}
      />
    </SettingsLayout>
  )
}

export default ModulesSettings

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  if (token) {
    await Promise.all([
      client.prefetchQuery('deal-stages', () => getDealStages(token)),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}
