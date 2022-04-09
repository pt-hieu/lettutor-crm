import { Table, TableColumnsType, notification } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { useModal } from '@utils/hooks/useModal'
import { formatDate } from '@utils/libs/time'
import { Attachments } from '@utils/models/note'
import { deleteAttachment } from '@utils/service/attachment'
import { getRawUsers } from '@utils/service/user'

import Confirm from './Confirm'
import Dropdown from './Dropdown'
import Menu from './Menu'
import Tooltip from './Tooltip'
import UpdateLinkAttachmentModal from './UpdateLinkAttachmentModal'

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
type TProps = {
  data: Attachments[]
  moduleName: string
  entityId: string
}

export default function AttachmentTable({
  data,
  entityId,
  moduleName,
}: TProps) {
  const client = useQueryClient()
  const { data: users, refetch } = useQuery('raw-users', getRawUsers(), {
    enabled: false,
  })

  useEffect(() => {
    refetch()
  }, [])

  const { mutateAsync: removeAttachment } = useMutation(
    'delete-attachment',
    deleteAttachment,
    {
      onMutate() {
        setSelectedDeleteId(undefined)
      },
      onSuccess() {
        client.refetchQueries([moduleName, entityId])
        notification.success({ message: 'Delete attachment successfully' })
      },
      onError() {
        notification.success({ message: 'Delete attachment unsuccessfully' })
      },
    },
  )

  const [selectedDeleteId, setSelectedDeleteId] = useState<string>()
  const [selectedUpdateId, setSelectedUpdateId] = useState<string>()

  const [confirm, openConfirm, closeConfirm] = useModal()
  const [update, openUpdate, closeUpdate] = useModal()

  useEffect(() => {
    if (!selectedDeleteId) return
    openConfirm()
  }, [selectedDeleteId])

  useEffect(() => {
    if (!selectedUpdateId) return
    openUpdate()
  }, [selectedUpdateId])

  useEffect(() => {
    if (update) return
    setSelectedUpdateId(undefined)
  }, [update])

  const columns = useMemo<TableColumnsType<Attachments>>(
    () => [
      {
        title: 'Name',
        dataIndex: 'key',
        key: 'name',
        render: (value, record) => (
          <AttachmentCell
            value={value}
            record={record}
            onRemove={setSelectedDeleteId}
            onUpdate={setSelectedUpdateId}
          />
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
    [users],
  )

  return (
    <>
      <Confirm
        visible={confirm}
        message="Are you sure you want to delete the attachment?"
        close={closeConfirm}
        onYes={() => removeAttachment([selectedDeleteId!])}
      />

      <UpdateLinkAttachmentModal
        onRefetch={() => client.refetchQueries([moduleName, entityId])}
        visible={update}
        close={closeUpdate}
        data={data.find((item) => item.id === selectedUpdateId)!}
      />

      <Table
        showSorterTooltip={false}
        columns={columns}
        dataSource={data}
        rowKey={(r) => r.id}
        bordered
        pagination={false}
      />
    </>
  )
}

type AttachmentCellProps = {
  record: Attachments
  value: string
  onRemove: (id: string) => void
  onUpdate: (id: string) => void
}

function AttachmentCell({
  record,
  value,
  onRemove: remove,
  onUpdate: update,
}: AttachmentCellProps) {
  const [isPopupOpen, setPopupOpen] = useState(false)

  return (
    <span className="group flex gap-4 items-center relative">
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

      <Dropdown
        triggerOnHover={false}
        onVisibilityChange={setPopupOpen}
        overlay={
          <Menu
            items={[
              record.external
                ? {
                    title: (
                      <span className="grid grid-cols-[15px,1fr] gap-2 items-center">
                        <span className="fa fa-edit" />
                        Update
                      </span>
                    ),
                    action: () => update(record.id),
                    key: 'update',
                  }
                : undefined,
              {
                title: (
                  <span className="grid grid-cols-[15px,1fr] gap-2 items-center">
                    <span className="fa fa-trash" />
                    Delete
                  </span>
                ),
                key: 'delete',
                action: () => remove(record.id),
              },
            ]}
          />
        }
      >
        <button
          className={`opacity-0 group-hover:opacity-100 crm-transition w-6 aspect-square text-gray-500 hover:text-white hover:bg-blue-600 rounded-full relative ${
            isPopupOpen ? 'text-white bg-blue-600 opacity-100' : ''
          }`}
        >
          <span className="fa fa-ellipsis-h" />
        </button>
      </Dropdown>
    </span>
  )
}
