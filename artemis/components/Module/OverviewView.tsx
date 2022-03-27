import { Table, TableColumnType } from 'antd'
import { capitalize } from 'lodash'
import { useMemo } from 'react'
import { useQuery, useQueryClient } from 'react-query'

import Layout from '@utils/components/Layout'
import Paginate from '@utils/components/Paginate'
import { useQueryState } from '@utils/hooks/useQueryState'
import { FieldType, Module } from '@utils/models/module'
import { getEntities } from '@utils/service/module'

import ModuleFilter from './ModuleFilter'
import ModuleHeader from './ModuleHeader'

type Props = {
  module: Module
}

export function toCapitalizedWords(name: string) {
  const words = name.match(/[A-Za-z][a-z]*/g) || []
  return words.map(capitalize).join(' ')
}

export default function OverviewView({ module }: Props) {
  const { name } = module
  const client = useQueryClient()

  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')

  const colums = useMemo<TableColumnType<any>[]>(
    () =>
      module.meta?.map((field) => {
        if (field.type === FieldType.RELATION) {
          field.name = field.name.replace('Id', '')
        }

        return {
          title: toCapitalizedWords(field.name),
          render: (_, { data }) => data?.[field.name],
        }
      }) || [],
    [],
  )

  const { data, isLoading } = useQuery(
    [name, page || 1, limit || 10],
    getEntities(name, { page, limit }),
  )

  return (
    <Layout title={`${capitalize(name)} | CRM`}>
      <div className="crm-container grid grid-cols-[300px,1fr] gap-4">
        <ModuleFilter module={module} />
        <div className="overflow-x-hidden">
          <ModuleHeader module={module} />

          <div className="mt-4">
            <div className="w-full flex flex-col gap-4">
              <Table
                showSorterTooltip={false}
                columns={colums}
                dataSource={data?.items}
                rowKey={(u) => u.id}
                loading={isLoading}
                rowSelection={{
                  type: 'checkbox',
                  onChange: (ids) => {
                    client.setQueryData(
                      ['selected-ids', module.name],
                      ids.map((id) => id.toString()),
                    )
                  },
                }}
                bordered
                pagination={false}
              />

              <Paginate
                containerClassName="self-end"
                pageSize={limit || 10}
                currentPage={page || 1}
                totalPage={0}
                onPageChange={setPage}
                showJumpToHead
                showQuickJump
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
