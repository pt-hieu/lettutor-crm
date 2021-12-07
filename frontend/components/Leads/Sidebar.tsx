import { LeadSource, LeadStatus } from '@utils/models/lead'
import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { FormProvider, useForm } from 'react-hook-form'
import MultipleQuery from '@utils/components/MultipleQuery'

type FormData = {
  status: Array<LeadStatus>
  source: Array<LeadSource>
}

type Props = {
  onSourceChange: (v: LeadSource[] | undefined) => void
  onStatusChange: (v: LeadStatus[] | undefined) => void
  source: LeadSource[] | undefined
  status: LeadStatus[] | undefined
}

export default function LeadSidebar({
  onSourceChange: setSource,
  onStatusChange: setStatus,
  source,
  status,
}: Props) {
  const form = useForm<FormData>({
    defaultValues: {
      source,
      status,
    },
  })

  const applyFilter = useCallback(
    form.handleSubmit(({ source, status }) => {
      setSource(source || [])

      setTimeout(() => {
        setStatus(status || [])
      }, 0)
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
          <div className="font-medium mb-2">Status</div>
          <MultipleQuery
            name="status"
            options={Object.values(LeadStatus)}
            type="checkbox"
          />

          <div className="font-medium my-2">Source</div>
          <MultipleQuery
            name="source"
            options={Object.values(LeadSource)}
            type="checkbox"
          />
        </FormProvider>
      </form>
    </div>
  )
}
