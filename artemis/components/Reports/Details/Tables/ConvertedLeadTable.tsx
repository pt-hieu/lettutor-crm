import { Popover, Table, TableColumnType } from 'antd'
import Link from 'next/link'
import React, { useMemo } from 'react'

import { toCapitalizedWords } from '@components/Module/OverviewView'
import RelationCell from '@components/Module/RelationCell'

import { Entity, FieldType, Module } from '@utils/models/module'
import { Paginate } from '@utils/models/paging'

interface IProps {
  module: Module
  data?: Paginate<Entity>
  isLoading?: boolean
}

const convertedModules = ['deal', 'contact', 'account']

export const ConvertedLeadTable = ({ module, data, isLoading }: IProps) => {
  const colums = useMemo<TableColumnType<any>[]>(
    () =>
      (
        [
          {
            title: 'Name',
            dataIndex: 'name',
            render: (value) => (
              <Popover
                trigger="click"
                content="Cannot access the converted Lead"
                placement="top"
              >
                <a className="crm-link underline hover:underline">{value}</a>
              </Popover>
            ),
          },
        ] as TableColumnType<any>[]
      )
        .concat(
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
        )
        .concat(
          convertedModules.map((module) => ({
            title: toCapitalizedWords(module) + ' Name',
            render: (_, { converted_info }) => {
              const convertedModule = ((converted_info || []) as any[]).find(
                (item) => item.moduleName === module,
              )
              if (!convertedModule) return <p>-</p>
              return (
                <Link href={`/${module}/${convertedModule.entityId}`}>
                  <a className="crm-link underline hover:underline">
                    {convertedModule.entityName}
                  </a>
                </Link>
              )
            },
          })),
        ),
    [module],
  )
  return (
    <Table
      showSorterTooltip={false}
      columns={colums}
      dataSource={data?.items}
      rowKey={(u) => u.id}
      loading={isLoading}
      bordered
      pagination={false}
    />
  )
}
