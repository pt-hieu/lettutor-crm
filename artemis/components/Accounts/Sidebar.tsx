import { useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { FormProvider, useForm } from 'react-hook-form'

import MultipleQuery from '@utils/components/MultipleQuery'
import { AccountType } from '@utils/models/account'

type FormData = {
  type: Array<AccountType>
}

type Props = {
  onPerformFilter?: () => void
  onTypeChange: (v: AccountType[] | undefined) => void
  type: AccountType[] | undefined
}

export default function AccountsSidebar({
  onTypeChange: setType,
  type,
  onPerformFilter,
}: Props) {
  const form = useForm<FormData>({
    defaultValues: {
      type,
    },
  })

  useEffect(() => {
    const subs = form.watch(() => {
      form.handleSubmit(({ type }) => {
        unstable_batchedUpdates(() => {
          type && setType(type)
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
          <div className="font-medium my-2">Type</div>
          <MultipleQuery
            name="type"
            options={Object.values(AccountType)}
            type="checkbox"
          />
        </FormProvider>
      </form>
    </div>
  )
}
