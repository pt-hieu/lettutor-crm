import { Table, TableColumnType } from 'antd'
import { capitalize } from 'lodash'
import Link from 'next/link'
import { useMemo } from 'react'
import { useQuery, useQueryClient } from 'react-query'

import Layout from '@utils/components/Layout'
import Paginate from '@utils/components/Paginate'
import { useQueryState } from '@utils/hooks/useQueryState'
import { useRelationField } from '@utils/hooks/useRelationField'
import { FieldType, Module } from '@utils/models/module'
import { getEntities } from '@utils/service/module'

import ModuleFilter from './ModuleFilter'
import ModuleHeader from './ModuleHeader'
import RelationCell from './RelationCell'

type Props = {
  module: Module
}

export function toCapitalizedWords(name: string) {
  const words = name.match(/[A-Za-z][a-z]*/g) || []
  return words.map(capitalize).join(' ')
}

export default function OverviewView({ module }: Props) {
  const { name, meta } = module
  const client = useQueryClient()

  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')
  const [search, setSearch] = useQueryState<string>('search')

  useRelationField(meta)

  const colums = useMemo<TableColumnType<any>[]>(
    () =>
      (
        [
          {
            title: 'Name',
            dataIndex: 'name',
            render: (value, { id }) => (
              <Link href={`/${name}/${id}`}>
                <a className="crm-link underline hover:underline">{value}</a>
              </Link>
            ),
          },
        ] as TableColumnType<any>[]
      ).concat(
        module.meta
          ?.filter((field) => field.visibility.Overview)
          .map((field) => {
            const col: TableColumnType<any> = {
              title: toCapitalizedWords(field.name.replace('Id', '')),
              render: (_, { data }) => data?.[field.name],
              ...(field.type === FieldType.RELATION && {
                render: (_, { data }) => (
                  <RelationCell
                    relateTo={field.relateTo || ''}
                    targetId={data?.[field.name]}
                  />
                ),
              }),
            }

            return col
          }) || [],
      ),
    [module],
  )

  const { data, isLoading } = useQuery(
    [name, page || 1, limit || 10, search || ''],
    getEntities(name, { page, limit, search }),
  )

  return (
    <Layout title={`${capitalize(name)} | CRM`}>
      <div className="crm-container grid grid-cols-[300px,1fr] gap-4">
        <ModuleFilter module={module} />
        <div className="overflow-x-hidden">
          <ModuleHeader
            search={search}
            onSearchChange={setSearch}
            module={module}
          />

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
                totalPage={data?.meta.totalPages}
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
