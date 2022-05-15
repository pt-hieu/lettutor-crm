import { Empty, Popconfirm, Popover, Table } from 'antd'
import { arrayMoveImmutable } from 'array-move'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc'

import Tooltip from '@utils/components/Tooltip'
import { DealStage, DealStageAction, DealStageType } from '@utils/models/deal'

import { EditableCell, EditableRow } from './EditableCell'

const DragHandle = SortableHandle(() => (
  <span className="fa fa-bars cursor-grab" />
))

const SortableItem = SortableElement((props: any) => <EditableRow {...props} />)
const SortableBody = SortableContainer((props: any) => (
  <tbody ref={props.tableRef} {...props} />
))

export interface DealStageData extends Partial<DealStage> {
  isNew?: boolean
  isDeleted?: boolean
  isUpdated?: boolean
  action?: DealStageAction
}

interface IProps {
  dataSource: DealStageData[]
  setDataSource: (data: DealStageData[]) => void
  isLoading: boolean
}

export const DealStageTable = ({
  dataSource,
  setDataSource,
  isLoading,
}: IProps) => {
  const onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number
    newIndex: number
  }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(
        [].concat(dataSource as any),
        oldIndex,
        newIndex,
      ).filter((el) => !!el) as DealStageData[]

      setDataSource(newData)
    }
  }

  const DraggableContainer = (props: any) => (
    <SortableBody
      useDragHandle
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  )

  const DraggableBodyRow = ({ ...restProps }: any) => {
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex(
      (x: DealStageData) => x.id === restProps['data-row-key'],
    )
    return <SortableItem index={index} {...restProps} />
  }

  const handleUpdateData = (row: DealStageData) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => row.id === item.id)
    const item = newData[index]
    newData.splice(index, 1, {
      ...item,
      ...row,
      isUpdated: true,
    })
    setDataSource(newData)
  }

  const handleDelete = (key: React.Key) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => item.id === key)
    if (index < 0) return
    newData[index].isDeleted = true
    setDataSource(newData)
  }

  const handleAdd = (id: string | null) => {
    const newData: DealStageData = {
      id: new Date().toString(),
      name: '',
      probability: 0,
      type: DealStageType.OPEN,
      isNew: true,
    }
    if (id === null) {
      //Empty list
      setDataSource([newData])
      return
    }

    const index = dataSource.findIndex((item) => item.id === id)

    if (index < 0) return

    const newDataSource = dataSource.filter((item) => item.name)
    newDataSource.splice(index + 1, 0, newData)

    setDataSource(newDataSource)
  }

  const columns = [
    {
      title: 'Sort',
      dataIndex: 'sort',
      width: 64,
      className: 'w-[64px]',
      render: () => <DragHandle />,
    },
    {
      title: 'Stage Name',
      dataIndex: 'name',
      width: 300,
      className: 'min-w-[300px] max-w-[300px]',
      editable: true,
    },
    {
      title: 'Probability (%)',
      dataIndex: 'probability',
      width: 180,
      className: 'w-[180px]',
      editable: true,
    },
    {
      title: 'Deal category',
      dataIndex: 'type',
      width: 180,
      className: 'w-[180px]',
      editable: true,
      as: 'select',
      selectSource: Object.values(DealStageType),
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_: any, record: DealStageData) =>
        dataSource.length >= 1 ? (
          <div className="flex gap-2">
            {record.deals?.length ? (
              <Popover
                title="Cannot delete"
                trigger="click"
                content="Exist deals binding with this stage"
              >
                <button className="crm-icon-btn hover:text-red-500 hover:border-red-500">
                  <i className="fa fa-trash" />
                </button>
              </Popover>
            ) : (
              <button
                className="crm-icon-btn hover:text-red-500 hover:border-red-500"
                onClick={() => handleDelete(record.id as string)}
              >
                <i className="fa fa-trash" />
              </button>
            )}

            <button
              className="crm-icon-btn hover:text-blue-500 hover:border-blue-500"
              onClick={() => handleAdd(record.id as string)}
            >
              <i className="fa fa-plus" />
            </button>
          </div>
        ) : undefined,
    },
  ]

  const mapColumns = columns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: DealStageData) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleUpdateData,
        as: col.as,
        selectSource: col.selectSource,
      }),
    }
  })

  const locale = {
    emptyText: (
      <div className="relative">
        <Tooltip title="Add new deal stage">
          <button
            className="crm-icon-btn w-10 text-blue-500 hover:border-blue-500 absolute translate-y-[100%]"
            onClick={() => handleAdd(null)}
          >
            <i className="fa fa-plus" onClick={() => handleAdd(null)} />
          </button>
        </Tooltip>
        <Empty />
      </div>
    ),
  }

  return (
    <Table
      pagination={false}
      dataSource={dataSource.filter((item) => !item.isDeleted)}
      columns={mapColumns}
      rowKey="id"
      bordered
      locale={locale}
      loading={isLoading}
      components={{
        body: {
          wrapper: DraggableContainer,
          row: DraggableBodyRow,
          cell: EditableCell,
        },
      }}
    />
  )
}
