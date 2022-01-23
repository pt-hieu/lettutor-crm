import MultipleQuery from '@utils/components/MultipleQuery'
import { TaskPriority, TaskStatus } from '@utils/models/task'
import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

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

  const applyFilter = useCallback(
    form.handleSubmit(({ status, priority }) => {
      setFilters(status || [], priority || [])
    }),
    [],
  )

  return (
    <div className="text-gray-700 bg-gray-100 flex flex-col gap-3 p-4 rounded-md">
      <div className="flex justify-between border-b pb-2 mb-2 items-center">
        <div className="font-semibold ">Filters</div>
        <button onClick={applyFilter} className="crm-button-outline">
          Apply
        </button>
      </div>

      <form>
        <FormProvider {...form}>
          <div className="font-medium my-2">Status</div>
          <MultipleQuery
            name="status"
            options={Object.values(TaskStatus)}
            type="checkbox"
          />
          <div className="font-medium my-2">Priority</div>
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
