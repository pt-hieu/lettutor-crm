import { Table, TableColumnType } from 'antd'
import Link from 'next/link'
import React, { ReactNode, useMemo } from 'react'

import { toCapitalizedWords } from '@components/Module/OverviewView'
import RelationCell from '@components/Module/RelationCell'

import { Entity, FieldType, Module } from '@utils/models/module'
import { Paginate } from '@utils/models/paging'

interface IProps {
  module: Module
  dataKey: string
  data?: Paginate<Entity>
  isLoading?: boolean
  relationTo?: string
}

export const GroupedTable = ({
  module,
  data,
  isLoading,
  dataKey,
  relationTo,
}: IProps) => {
  const groupedData = useMemo(
    () =>
      [
        ...new Set((data?.items || []).map((item) => item.data[dataKey])),
      ].reduce((target: any[], current) => {
        const groupItems =
          data?.items.filter((item) => item.data[dataKey] === current) || []
        return [...target, ...groupItems]
      }, []),
    [data, dataKey],
  )

  const columns = useMemo(
    () =>
      (
        [
          {
            title: toCapitalizedWords(dataKey.replace('Id', '')),
            dataIndex: dataKey,
            key: dataKey,
            onCell: (record: any, row: number) => {
              if (
                row &&
                groupedData[row - 1].data[dataKey] === record.data[dataKey]
              ) {
                return { rowSpan: 0 }
              }
              const count = groupedData?.filter(
                (item: any) => item.data[dataKey] === record.data[dataKey],
              ).length
              return { rowSpan: count }
            },
            render: (_, record) => (
              <div className="font-semibold">
                {relationTo ? (
                  <RelationCell
                    relateTo={relationTo}
                    targetId={record.data[dataKey]}
                  />
                ) : (
                  record.data[dataKey] || '-'
                )}
                <span className="px-1 text-blue-500">
                  (
                  {
                    data?.items?.filter(
                      (item: any) =>
                        item.data[dataKey] === record.data[dataKey],
                    ).length
                  }
                  )
                </span>
              </div>
            ),
          },
          {
            title: 'Name',
            dataIndex: 'name',
            render: (value, { id }) => (
              <Link href={`/${module.name}/${id}`}>
                <a className="crm-link underline hover:underline">{value}</a>
              </Link>
            ),
          },
        ] as TableColumnType<any>[]
      ).concat(
        module.meta
          ?.filter(
            (field) => field.visibility.Overview && field.name !== dataKey,
          )
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
    [module, groupedData],
  )

  return (
    <Table
      showSorterTooltip={false}
      columns={columns}
      dataSource={groupedData}
      rowKey={(u) => u.id}
      loading={isLoading}
      bordered
      pagination={false}
    />
  )
}
