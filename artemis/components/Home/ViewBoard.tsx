import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { Paginate } from '@utils/models/paging'
import { Empty, Pagination, Spin, Table, TableColumnType } from 'antd'
import { useEffect, useState } from 'react'

const LIMIT_ITEMS = 10

type ViewProps<T> = {
  title: string
  isLoading: boolean
  page: number
  data: Paginate<T> | undefined
  columns: TableColumnType<T>[]
  tableWidth?: number
  onChangePage: (page: number) => void
}

export const ViewBoard = ({
  data,
  title,
  columns,
  page,
  onChangePage,
  isLoading,
  tableWidth,
}: ViewProps<any>) => {
  const [start, end, total] = usePaginateItem(data)
  const [isFirstLoading, setIsFirstLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      setIsFirstLoading(false)
    }
  }, [isFirstLoading])

  const isNoData = !isLoading && (!data || data.items.length === 0)

  const ContentByStatus = () => {
    if (isFirstLoading) {
      return (
        <div className="flex h-full flex-col justify-center">
          <Spin size="large" />
        </div>
      )
    }

    if (isNoData) {
      return (
        <div className="flex h-full flex-col justify-center">
          <Empty description={`No ${title} found.`} />
        </div>
      )
    }

    return (
      <>
        <div className="flex-1">
          <Table
            showSorterTooltip={false}
            columns={columns}
            bordered
            loading={isLoading}
            dataSource={data?.items}
            rowKey={(u) => u.id}
            pagination={false}
            scroll={{ x: tableWidth || 1000, y: 224 }}
          />
        </div>
      </>
    )
  }

  return (
    <div className="border shadow-md rounded-md flex flex-col p-4 h-[400px]">
      <div className="pb-2 font-semibold text-lg border-b-2">{title}</div>
      <ContentByStatus />
      {!isNoData && (
        <div className="flex place-self-end pt-4">
          <Pagination
            size="small"
            current={page}
            defaultCurrent={1}
            defaultPageSize={LIMIT_ITEMS}
            pageSize={LIMIT_ITEMS}
            total={data?.meta.totalItems}
            showTotal={() => (
              <span className="text-blue-500">
                Showing from {start} to {end} of {total} results
              </span>
            )}
            onChange={(page) => {
              onChangePage(page)
            }}
          />
        </div>
      )}
    </div>
  )
}
