import { Table, TableColumnsType } from 'antd'
import { useEffect, useMemo } from 'react'
import { useQuery } from 'react-query'

import { formatDate } from '@utils/libs/time'
import { Attachments } from '@utils/models/note'
import { getRawUsers } from '@utils/service/user'

import Tooltip from './Tooltip'

type TProps = {
  data: Attachments[]
}

if (!(Number.prototype as any).toSize) {
  Object.defineProperty(Number.prototype, 'toSize', {
    value: function (a: any, b: any, c: any, d: any) {
      return (
        ((a = a ? [1e3, 'k', 'B'] : [1024, 'K', 'iB']),
        (b = Math),
        (c = b.log),
        (d = (c(this) / c(a[0])) | 0),
        this / b.pow(a[0], d)).toFixed(2) +
        ' ' +
        (d ? (a[1] + 'MGTPEZY')[--d] + a[2] : 'Bytes')
      )
    },
    writable: false,
    enumerable: false,
  })
}

export default function AttachmentTable({ data }: TProps) {
  const { data: users, refetch } = useQuery('raw-users', getRawUsers(), {
    enabled: false,
  })

  useEffect(() => {
    refetch()
  }, [])

  const columns = useMemo<TableColumnsType<Attachments>>(
    () => [
      {
        title: 'Name',
        dataIndex: 'key',
        key: 'name',
        render: (value, record) => (
          <a
            className="crm-link grid grid-cols-[30px,1fr] items-center w-[fit-content]"
            href={record.location}
            target={record.external ? '_blank' : undefined}
            rel={record.external ? 'noopener noreferrer' : undefined}
          >
            <span
              className={`fa ${
                record.external ? 'fa-link' : 'fa-file inline-block ml-1'
              }`}
            />

            <Tooltip title={record.location} disabled={!record.external}>
              {value}
            </Tooltip>
          </a>
        ),
      },
      {
        title: 'Attached By',
        key: 'attachedBy',
        render: (_, record) =>
          users?.find((user) => user.id === record.attachedById)?.name,
      },
      {
        title: 'Date Added',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value) => formatDate(value),
      },
      {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
        render: (v) => (v ? v.toSize() : ''),
      },
    ],
    [],
  )

  return (
    <Table
      showSorterTooltip={false}
      columns={columns}
      dataSource={data}
      rowKey={(r) => r.id}
      bordered
      pagination={false}
    />
  )
}
