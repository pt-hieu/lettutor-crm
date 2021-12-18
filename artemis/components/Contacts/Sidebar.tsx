import MultipleQuery from '@utils/components/MultipleQuery'
import { LeadSource, LeadStatus } from '@utils/models/lead'
import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

type FormData = {
  status: Array<LeadStatus>
  source: Array<LeadSource>
}

type Props = {
  onSourceChange: (v: LeadSource[] | undefined) => void
  source: LeadSource[] | undefined
}

export default function ContactsSidebar({
  onSourceChange: setSource,
  source,
}: Props) {
  const form = useForm<FormData>({
    defaultValues: {
      source,
    },
  })

  const applyFilter = useCallback(
    form.handleSubmit(({ source }) => {
      setSource(source || [])
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
