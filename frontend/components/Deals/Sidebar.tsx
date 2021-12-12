import MultipleQuery from '@utils/components/MultipleQuery'
import { DealStage } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'
import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

type FormData = {
  source: Array<LeadSource>
  stage: Array<DealStage>
}

type Props = {
  onSourceChange: (v: LeadSource[] | undefined) => void
  source: LeadSource[] | undefined
  onStageChange: (v: DealStage[] | undefined) => void
  stage: DealStage[] | undefined
}

export default function DealsSidebar({
  onSourceChange: setSource,
  source,
  onStageChange: setStage,
  stage,
}: Props) {
  const form = useForm<FormData>({
    defaultValues: {
      source,
      stage,
    },
  })

  const applyFilter = useCallback(
    form.handleSubmit(({ source, stage }) => {
      setSource(source || [])
      setTimeout(() => {
        setStage(stage || [])
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
          <div className="font-medium my-2">Lead Source</div>
          <MultipleQuery
            name="source"
            options={Object.values(LeadSource)}
            type="checkbox"
          />
          <div className="font-medium my-2">Deal Stage</div>
          <MultipleQuery
            name="stage"
            options={Object.values(DealStage)}
            type="checkbox"
          />
        </FormProvider>
      </form>
    </div>
  )
}
