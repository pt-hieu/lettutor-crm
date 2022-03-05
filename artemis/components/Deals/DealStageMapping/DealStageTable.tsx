import { MenuOutlined } from '@ant-design/icons'
import {
  DealCategory,
  DealStageData,
  ForecastCategory,
} from '@utils/models/deal'
import { Popconfirm, Table } from 'antd'
import { arrayMoveImmutable } from 'array-move'
import { useState } from 'react'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc'
import { EditableCell, EditableRow } from './EditableCell'

const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
))
const SortableItem = SortableElement((props: any) => <EditableRow {...props} />)
const SortableBody = SortableContainer((props: any) => <tbody {...props} />)

export interface TData extends DealStageData {
  isNew?: boolean
  isDeleted?: boolean
}

interface IProps {
  data: DealStageData[]
}

export const DealStageTable = ({ data }: IProps) => {
  const [dataSource, setDataSource] = useState<TData[]>(data)
  const [count, setCount] = useState<number>(data.length)

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
      ).filter((el) => !!el)
      console.log('Sorted items: ', newData)
      setDataSource(newData)
    }
  }

  const DraggableContainer = (props: any) => (
    <SortableBody
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  )

  const DraggableBodyRow = ({ ...restProps }: any) => {
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex(
      (x: TData) => x.id === restProps['data-row-key'],
    )
    return <SortableItem index={index} {...restProps} />
  }

  const handleSaveSort = (row: TData) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => row.id === item.id)
    const item = newData[index]
    newData.splice(index, 1, {
      ...item,
      ...row,
    })
    setDataSource(newData)
  }

  const handleDelete = (key: React.Key) => {
    const newDataSource = [...dataSource]
    setDataSource(newDataSource.filter((item) => item.id !== key))
  }

  const handleAdd = (id: string) => {
    const index = dataSource.findIndex((item) => item.id === id)
    if (index < 0) {
      return
    }
    const newData: TData = {
      id: count.toString(),
      name: '',
      probability: 0,
      dealCategory: DealCategory.OPEN,
      forecastCategory: ForecastCategory.PIPELINE,
      isNew: true,
    }

    const newDataSource = [...dataSource]
    newDataSource.splice(index + 1, 0, newData)

    setDataSource(newDataSource)
    setCount((prev) => prev + 1)
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
      width: 280,
      className: 'min-w-[280px] max-w-[280px]',
      editable: true,
    },
    {
      title: 'Probability (%)',
      dataIndex: 'probability',
      width: 140,
      className: 'w-[140px]',
      editable: true,
    },
    {
      title: 'Deal category',
      dataIndex: 'dealCategory',
      width: 180,
      className: 'w-[180px]',
      editable: true,
      as: 'select',
      selectSource: Object.values(DealCategory),
    },
    {
      title: 'Forecast Category',
      dataIndex: 'forecastCategory',
      width: 180,
      className: 'w-[180px]',
      editable: true,
      as: 'select',
      selectSource: Object.values(ForecastCategory),
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_: any, record: TData) =>
        dataSource.length >= 1 ? (
          <div className="flex gap-2">
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record.id)}
            >
              <i className="crm-icon-btn fa fa-trash hover:text-red-500 hover:border-red-500" />
            </Popconfirm>

            <i
              className="crm-icon-btn fa fa-plus hover:text-blue-500 hover:border-blue-500"
              onClick={() => handleAdd(record.id)}
            />
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
      onCell: (record: TData) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSaveSort,
        as: col.as,
        selectSource: col.selectSource,
      }),
    }
  })

  return (
    <Table
      pagination={false}
      dataSource={dataSource}
      columns={mapColumns}
      rowKey="id"
      bordered
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
