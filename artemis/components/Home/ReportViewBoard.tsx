import { Empty } from 'antd'

import { BasicTable } from '@components/Reports/Details/Tables/BasicTable'

import Paginate from '@utils/components/Paginate'
import { usePaginateItem } from '@utils/hooks/usePaginateItem'
import { Entity, Module } from '@utils/models/module'
import { Paginate as TPaginate } from '@utils/models/paging'

const LIMIT_ITEMS = 10

type ViewProps = {
  title: string
  isLoading: boolean
  page: number
  data?: TPaginate<Entity>
  tableWidth?: number
  onChangePage: (page: number) => void
  module: Module
}

export function ReportViewBoard({
  data,
  title,
  page,
  onChangePage,
  isLoading,
  tableWidth,
  module,
}: ViewProps) {
  const [start, end, total] = usePaginateItem(data)
  const isNoData = !isLoading && (!data || data.items.length === 0)

  return (
    <div className="border rounded-md flex flex-col p-4 h-[400px]">
      <div className="font-semibold text-lg">{title}</div>

      {isNoData && (
        <div className="flex h-full flex-col justify-center">
          <Empty description={`No ${title} found.`} />
        </div>
      )}

      {!isNoData && (
        <div className="pt-4 flex-1">
          <BasicTable module={module} data={data} isLoading={isLoading} />
        </div>
      )}

      {!isNoData && (
        <div className="flex items-center gap-2 place-self-end pt-4">
          <span className="text-blue-500">
            Showing from {start} to {end} of {total} results
          </span>

          <Paginate
            currentPage={page}
            pageSize={LIMIT_ITEMS}
            totalPage={data?.meta.totalPages}
            onPageChange={onChangePage}
          />
        </div>
      )}
    </div>
  )
}
