import { Table, TableColumnType } from 'antd'
import Link from 'next/link'
import React, { useMemo } from 'react'

import { toCapitalizedWords } from '@components/Module/OverviewView'
import RelationCell from '@components/Module/RelationCell'

import { useStore } from '@utils/hooks/useStore'
import { Entity, FieldType, Module } from '@utils/models/module'
import { Paginate } from '@utils/models/paging'

interface IProps {
  module: Module
  data?: Paginate<Entity>
  isLoading?: boolean
}

export const PipelineByStageTable = ({ module, data, isLoading }: IProps) => {
  const { data: dealStages } = useStore<{ id: string; name: string }[]>([
    'relation-data',
    'dealstage',
  ])

  const groupedData = useMemo(
    () =>
      dealStages?.reduce((target: any[], current) => {
        const groupItems = data?.items.filter(
          (item) => item.data.stageId === current.id,
        )
        if (groupItems?.length) {
          return [...target, ...groupItems]
        }
        return [...target, { data: { stageId: current.id } }]
      }, []),

    [data, dealStages],
  )

  const colums = () => {
    let sameKey = ''
    return (
      [
        {
          title: 'Stage',
          dataIndex: 'stageId',
          key: 'stageId',
          onCell: (record: any) => {
            if (sameKey === record.data.stageId) {
              return { rowSpan: 0 }
            }
            const count = groupedData?.filter(
              (item: any) => item.data.stageId === record.data.stageId,
            ).length
            sameKey = record.data.stageId
            return { rowSpan: count }
          },
          render: (_, record) => (
            <div className="font-semibold">
              <RelationCell
                relateTo="dealstage"
                targetId={record.data.stageId}
              />
              <span className="px-1 text-blue-500">
                (
                {
                  data?.items?.filter(
                    (item: any) => item.data.stageId === record.data.stageId,
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
          (field) => field.visibility.Overview && field.name !== 'stageId',
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
    )
  }

  return (
    <Table
      showSorterTooltip={false}
      columns={colums()}
      dataSource={groupedData}
      rowKey={(u) => u.id}
      loading={isLoading}
      bordered
      pagination={false}
    />
  )
}
