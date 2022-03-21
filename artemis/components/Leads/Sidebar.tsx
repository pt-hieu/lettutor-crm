import { useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { FormProvider, useForm } from 'react-hook-form'

import MultipleQuery from '@utils/components/MultipleQuery'
import { LeadSource, LeadStatus } from '@utils/models/lead'

type FormData = {
  status: Array<LeadStatus>
  source: Array<LeadSource>
}

type Props = {
  onSourceChange: (v: LeadSource[] | undefined) => void
  onStatusChange: (v: LeadStatus[] | undefined) => void
  onPerformFilter?: () => void
  source: LeadSource[] | undefined
  status: LeadStatus[] | undefined
}

export default function LeadSidebar({
  onSourceChange: setSource,
  onStatusChange: setStatus,
  onPerformFilter,
  source,
  status,
}: Props) {
  const form = useForm<FormData>({
    defaultValues: {
      source,
      status,
    },
  })

  useEffect(() => {
    const subs = form.watch(() => {
      form.handleSubmit(({ source, status }) => {
        unstable_batchedUpdates(() => {
          status && setStatus(status)
          source && setSource(source)

          onPerformFilter && onPerformFilter()
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
          <div className="font-medium mb-2">Status</div>
          <MultipleQuery
            name="status"
            options={Object.values(LeadStatus)}
            type="checkbox"
          />

          <div className="font-medium my-2 mt-4">Source</div>
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
