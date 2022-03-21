import { useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { useQuery } from 'react-query'

import MultipleQuery from '@utils/components/MultipleQuery'
import { DealStage, DealStageData } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'

type FormData = {
  source: Array<LeadSource>
  stage: Array<DealStage>
}

type Props = {
  onSourceChange: (v: LeadSource[] | undefined) => void
  source: LeadSource[] | undefined
  onStageChange: (v: DealStage[] | undefined) => void
  stage: DealStage[] | undefined

  onPerformFilter?: () => void
}

export default function DealsSidebar({
  onSourceChange: setSource,
  source,
  onStageChange: setStage,
  stage,
  onPerformFilter,
}: Props) {
  const form = useForm<FormData>({
    defaultValues: {
      source,
      stage,
    },
  })

  useEffect(() => {
    const subs = form.watch(() => {
      form.handleSubmit(({ source, stage }) => {
        unstable_batchedUpdates(() => {
          source && setSource(source)
          stage && setStage(stage)

          onPerformFilter && onPerformFilter()
        })
      })()
    })

    return subs.unsubscribe
  }, [form.watch])

  const { data: dealStages } = useQuery<DealStageData[]>(['deal-stages'], {
    enabled: false,
  })

  const stageNames = dealStages?.map((s) => s.name) || []

  return (
    <div className="text-gray-700 border flex flex-col gap-3 p-4 pt-2 rounded-md">
      <div className="font-semibold text-[17px] border-b pb-2 mb-2">
        Filters
      </div>

      <form>
        <FormProvider {...form}>
          <div className="font-medium my-2">Lead Source</div>
          <MultipleQuery
            name="source"
            options={Object.values(LeadSource)}
            type="checkbox"
          />

          <div className="font-medium my-2 mt-4">Deal Stage</div>
          <MultipleQuery name="stage" options={stageNames} type="checkbox" />
        </FormProvider>
      </form>
    </div>
  )
}
