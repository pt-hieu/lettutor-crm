import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import Input from './Input'

type Props = {
  currentPage: number
  pageSize: number
  totalPage: number | undefined
  onPageChange?: (p: number) => void
  onLimitChange?: (l: number) => void
  showQuickJump?: boolean
  showJumpToHead?: boolean
  containerClassName?: string
}

const utilClassName =
  'w-8 aspect-square border hover:border-blue-600 rounded-md hover:text-white hover:bg-blue-600 crm-transition disabled:pointer-events-none disabled:text-gray-400'

export default function Paginate({
  currentPage,
  pageSize,
  totalPage,
  onLimitChange: changeLimit,
  onPageChange: changePage,
  showJumpToHead,
  showQuickJump,
  containerClassName,
}: Props) {
  const { register, watch, handleSubmit } = useForm<{ page: number }>({
    defaultValues: {
      page: Number(currentPage),
    },
  })

  useEffect(() => {
    const subs = watch(() => {
      handleSubmit((data) => {
        changePage && changePage(data.page)
      })()
    })

    return subs.unsubscribe
  }, [watch, changePage])

  return (totalPage || 0) > 1 ? (
    <div className={`flex ${containerClassName}`}>
      {showQuickJump && (
        <form noValidate className="mr-4 inline-block">
          <Input
            as="select"
            showError={false}
            props={{
              ...register('page'),
              children: Array.from(Array(totalPage).keys())
                .map((i) => i + 1)
                .map((item) => (
                  <option key={'item' + item} value={item}>
                    {item}
                  </option>
                )),
            }}
          />
        </form>
      )}
      <div className="flex gap-2">
        {showJumpToHead && (
          <button
            disabled={Number(currentPage) <= 1}
            onClick={() => changePage && changePage(1)}
            className={`fa fa-angle-double-left ${utilClassName}`}
          />
        )}

        <button
          disabled={Number(currentPage) <= 1}
          onClick={() => changePage && changePage(Number(currentPage) - 1)}
          className={`fa fa-angle-left ${utilClassName}`}
        />

        {Number(currentPage) > 1 && (
          <button
            onClick={() => changePage && changePage(Number(currentPage) - 1)}
            className={utilClassName}
          >
            {Number(currentPage) - 1}
          </button>
        )}

        <button
          className={utilClassName + ' text-white bg-blue-600 border-blue-600'}
        >
          {Number(currentPage)}
        </button>

        {Number(currentPage) < (totalPage || 0) && (
          <button
            onClick={() => changePage && changePage(Number(currentPage) + 1)}
            className={utilClassName}
          >
            {Number(currentPage) + 1}
          </button>
        )}

        <button
          onClick={() => changePage && changePage(Number(currentPage) + 1)}
          disabled={Number(currentPage) >= (totalPage || 0)}
          className={`fa fa-angle-right ${utilClassName}`}
        />

        {showJumpToHead && (
          <button
            onClick={() => changePage && changePage(totalPage || 0)}
            disabled={Number(currentPage) >= (totalPage || 0)}
            className={`fa fa-angle-double-right ${utilClassName}`}
          />
        )}
      </div>
    </div>
  ) : null
}
