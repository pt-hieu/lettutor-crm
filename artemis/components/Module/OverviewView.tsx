import { Table, TableColumnType } from 'antd'
import { capitalize } from 'lodash'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'

import Layout from '@utils/components/Layout'
import Paginate from '@utils/components/Paginate'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useObjectQuery } from '@utils/hooks/useObjectQuery'
import { useQueryState } from '@utils/hooks/useQueryState'
import { useRelationField } from '@utils/hooks/useRelationField'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { FieldType, Module } from '@utils/models/module'
import { ActionType, DefaultModule } from '@utils/models/role'
import { getEntities } from '@utils/service/module'

import KanbanMode from './KanbanMode'
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

export enum MODE {
  KANBAN = 'kanban',
  DEFAULT = 'default',
}

export default function OverviewView({ module }: Props) {
  const { name, meta } = module
  const client = useQueryClient()
  const auth = useAuthorization()
  const [session] = useTypedSession()
  const ownerId = session?.user.id

  const [page, setPage] = useQueryState<number>('page')
  const [limit, setLimit] = useQueryState<number>('limit')
  const [search, setSearch] = useQueryState<string>('search')
  const [filter, setFilter] = useState<object>({})

  useObjectQuery(filter)
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

  const key = [
    name,
    page || 1,
    limit || 10,
    search || '',
    ...Object.values(filter),
  ]

  const { data, isLoading } = useQuery(
    key,
    getEntities(name, { page, limit, search, ...filter }),
    {
      keepPreviousData: true,
    },
  )

  const [mode, setMode] = useQueryState<MODE>('mode', MODE.DEFAULT)
  useEffect(() => {
    setMode(MODE.DEFAULT)
  }, [module])

  return (
    <Layout title={`${capitalize(name)} | CRM`}>
      <div className="crm-container grid grid-cols-[300px,1fr] gap-4 h-full">
        <ModuleFilter
          filter={filter}
          onFilterChange={setFilter}
          module={module}
        />

        <div className="overflow-x-hidden h-[calc(100vh-175px)]">
          <ModuleHeader
            onModeChange={setMode}
            mode={mode!}
            search={search}
            onSearchChange={setSearch}
            module={module}
          />

          <div className="mt-4 h-[calc(100vh-252px)]">
            {mode !== MODE.KANBAN && (
              <div className="w-full flex flex-col gap-4">
                <Table
                  showSorterTooltip={false}
                  columns={colums}
                  dataSource={
                    auth(ActionType.CAN_VIEW_ALL, name)
                      ? data?.items
                      : data?.items.filter(
                          (item) => item.data.ownerId === ownerId,
                        )
                  }
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
            )}

            {mode === MODE.KANBAN && (
              <KanbanMode
                dataKey={key}
                entities={data?.items || []}
                module={module}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
