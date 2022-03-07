import {
  DealCategory,
  DealStageData,
  ForecastCategory,
} from '@utils/models/deal'
import { Empty, Popconfirm, Table, Tooltip } from 'antd'
import { arrayMoveImmutable } from 'array-move'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc'
import { EditableCell, EditableRow } from './EditableCell'

const DragHandle = SortableHandle(() => (
  <span className="fa fa-bars cursor-grab" />
))

const SortableItem = SortableElement((props: any) => <EditableRow {...props} />)
const SortableBody = SortableContainer((props: any) => (
  <tbody ref={props.tableRef} {...props} />
))

export interface TData extends DealStageData {
  isNew?: boolean
  isDeleted?: boolean
}

interface IProps {
  dataSource: DealStageData[]
  setDataSource: (data: TData[]) => void
}

export const DealStageTable = ({ dataSource, setDataSource }: IProps) => {
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

  const handleUpdateData = (row: TData) => {
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

  const handleAdd = (id: string | null) => {
    const newData: TData = {
      id: new Date().toString(),
      name: '',
      probability: 0,
      dealCategory: DealCategory.OPEN,
      forecastCategory: ForecastCategory.PIPELINE,
      isNew: true,
    }
    if (id === null) {
      //Empty list
      setDataSource([newData])
    }
    const index = dataSource.findIndex((item) => item.id === id)
    if (index < 0) {
      return
    }

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
          <i
            className="crm-icon-btn fa fa-plus p-4 text-blue-500 hover:border-blue-500 absolute translate-y-[100%]"
            onClick={() => handleAdd(null)}
          />
        </Tooltip>
        <Empty />
      </div>
    ),
  }

  return (
    <Table
      pagination={false}
      dataSource={dataSource}
      columns={mapColumns}
      rowKey="id"
      bordered
      locale={locale}
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
