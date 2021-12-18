import MultipleQuery from '@utils/components/MultipleQuery'
import { AccountType } from '@utils/models/account'
import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

type FormData = {
  type: Array<AccountType>
}

type Props = {
  onTypeChange: (v: AccountType[] | undefined) => void
  type: AccountType[] | undefined
}

export default function AccountsSidebar({
  onTypeChange: setType,
  type,
}: Props) {
  const form = useForm<FormData>({
    defaultValues: {
      type,
    },
  })

  const applyFilter = useCallback(
    form.handleSubmit(({ type }) => {
      setType(type || [])
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
