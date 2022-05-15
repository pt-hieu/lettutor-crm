import { Table, TableColumnsType } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from 'react-query'

import { DealStageModal } from '@components/DealStage/DealStageModal'
import ModuleModal from '@components/Settings/Modules/ModuleModal'
import SettingsLayout from '@components/Settings/SettingsLayout'

import { useModal } from '@utils/hooks/useModal'
import { Module } from '@utils/models/module'
import { getModules } from '@utils/service/module'

const ModulesSettings = () => {
  const [showStageMappingModal, openModal, closeModal] = useModal()
  const { push } = useRouter()

  const { data: modules, refetch } = useQuery('modules', getModules(), {
    enabled: false,
    select: (m) => m.sort((a, b) => a.name.localeCompare(b.name)),
  })

  useEffect(() => {
    if (modules) return
    refetch()
  }, [])

  const moduleRef = useRef<Module>()
  const [moduleModal, open, close] = useModal()

  const columns = useMemo<TableColumnsType<Module>>(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: { compare: (a, b) => a.name.localeCompare(b.name) },
        key: 'name',
        render: (_, { name }) => (
          <Link
            href={{
              pathname: '/settings/modules/[moduleName]',
              query: { moduleName: name },
            }}
          >
            <a className="capitalize crm-link underline hover:underline">
              {name}
            </a>
          </Link>
        ),
      },
      { title: 'Description', dataIndex: 'description' },
      {
        title: 'Actions',
        width: 300,
        render: (_, { meta, name, ...rest }) => (
          <div className="flex gap-2">
            <button
              onClick={() =>
                push({
                  pathname: '/settings/modules/[moduleName]',
                  query: { moduleName: name },
                })
              }
              className="crm-button"
            >
              Layout
            </button>

            <button
              onClick={() => {
                moduleRef.current = { meta, name, ...rest }
                open()
              }}
              className="crm-button"
            >
              Update
            </button>

            {meta?.some((field) => field.relateTo === 'dealstage') && (
              <button onClick={openModal} className="crm-button">
                Deal Stage
              </button>
            )}
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <SettingsLayout title="CRM | Modules and Fields">
      <DealStageModal
        visible={showStageMappingModal}
        handleClose={closeModal}
        isLoading={false}
      />

      <ModuleModal
        close={close}
        visible={moduleModal}
        module={moduleRef.current}
      />

      <div>
        <div className="flex justify-between items-center">
          <div className="font-medium text-xl mb-4 py-2">Modules</div>

          <button
            onClick={() => {
              moduleRef.current = undefined
              open()
            }}
            className="crm-button"
          >
            <span className="fa fa-plus mr-2" />
            Create Module
          </button>
        </div>

        <Table
          showSorterTooltip={false}
          columns={columns}
          pagination={false}
          bordered
          rowKey={(u) => u.id}
          dataSource={modules}
        />
      </div>
    </SettingsLayout>
  )
}

export default ModulesSettings
