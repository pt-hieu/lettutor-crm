import { useCallback, useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { FormProvider, useForm } from 'react-hook-form'

import MultipleQuery from '@utils/components/MultipleQuery'
import { LeadSource, LeadStatus } from '@utils/models/lead'

type FormData = {
  status: Array<LeadStatus>
  source: Array<LeadSource>
}

type Props = {
  onPerformFilter?: () => void
  onSourceChange: (v: LeadSource[] | undefined) => void
  source: LeadSource[] | undefined
}

export default function ContactsSidebar({
  onSourceChange: setSource,
  onPerformFilter,
  source,
}: Props) {
  const form = useForm<FormData>({
    defaultValues: {
      source,
    },
  })

  useEffect(() => {
    const subs = form.watch(() => {
      form.handleSubmit(({ source }) => {
        unstable_batchedUpdates(() => {
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
