import { useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { FormProvider, useForm } from 'react-hook-form'

import MultipleQuery from '@utils/components/MultipleQuery'
import { TaskPriority, TaskStatus } from '@utils/models/task'

type FormData = {
  status: Array<TaskStatus>
  priority: Array<TaskPriority>
}

type Props = {
  onFiltersChange: (
    status: TaskStatus[] | undefined,
    priority: TaskPriority[] | undefined,
  ) => void
  status: TaskStatus[] | undefined
  priority: TaskPriority[] | undefined
}

export default function TasksSidebar({
  onFiltersChange: setFilters,
  status,
  priority,
}: Props) {
  const form = useForm<FormData>({
    defaultValues: {
      status,
      priority,
    },
  })

  useEffect(() => {
    const subs = form.watch(() => {
      form.handleSubmit(({ priority, status }) => {
        unstable_batchedUpdates(() => {
          setFilters(status, priority)
        })
      })()
    })

    return subs.unsubscribe
  }, [form.watch])

  return (
    <div className="text-gray-700 border flex flex-col gap-3 p-4 pt-2 rounded-md">
      <div className="font-semibold text-[17px] border-b pb-2 mb-2">
        Filters
      </div>

      <form>
        <FormProvider {...form}>
          <div className="font-medium my-2">Status</div>
          <MultipleQuery
            name="status"
            options={Object.values(TaskStatus)}
            type="checkbox"
          />

          <div className="font-medium my-2 mt-4">Priority</div>
          <MultipleQuery
            name="priority"
            options={Object.values(TaskPriority)}
            type="checkbox"
          />
        </FormProvider>
      </form>
    </div>
  )
}
