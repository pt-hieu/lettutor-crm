import { useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import MultipleQuery from '@utils/components/MultipleQuery'
import { FieldType, Module } from '@utils/models/module'

type Props = {
  module: Module
  onFilterChange?: (v: object) => void
  filter?: object
}

export default function ModuleFilter({
  module,
  filter,
  onFilterChange,
}: Props) {
  const form = useForm()

  useEffect(() => {
    const subs = form.watch(() =>
      form.handleSubmit((data) => {
        if (!onFilterChange) return

        Object.keys(data).forEach((key) => {
          if (!data[key]) delete data[key]
        })

        onFilterChange(data)
      })(),
    )

    return subs.unsubscribe
  }, [form.watch])

  const selectableFields = useMemo(() => {
    return module.meta?.filter((field) => field.type === FieldType.SELECT)
  }, [module])

  useEffect(() => {
    const subs = form.watch(() => form.handleSubmit((data) => {})())
    return subs.unsubscribe
  }, [form.watch])

  return (
    <div className="text-gray-700 border flex flex-col gap-3 p-4 pt-2 rounded-md">
      <div className="font-semibold text-[17px] border-b pb-2 mb-2">
        Filters
      </div>

      <form className="flex flex-col gap-4">
        <FormProvider {...form}>
          {selectableFields?.map((field) => (
            <div key={field.name}>
              <div className="font-medium mb-2 capitalize">{field.name}</div>

              <MultipleQuery
                name={field.name}
                options={field.options || []}
                type="checkbox"
              />
            </div>
          ))}
        </FormProvider>
      </form>
    </div>
  )
}
