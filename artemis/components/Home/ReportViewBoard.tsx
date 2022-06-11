import { Empty } from 'antd'
import { useEffect, useState } from 'react'

import { BasicTable } from '@components/Reports/Details/Tables/BasicTable'

import Loading from '@utils/components/Loading'
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
          <Loading />
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
      <div className="pt-4 flex-1">
        <BasicTable module={module} data={data} isLoading={isLoading} />
      </div>
    )
  }

  return (
    <div className="border rounded-md flex flex-col p-4 h-[400px]">
      <div className="font-semibold text-lg">{title}</div>

      <ContentByStatus />

      {!isNoData && !isFirstLoading && (
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
