import { useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import MultipleQuery from '@utils/components/MultipleQuery'
import { FieldType, Module } from '@utils/models/module'

type Props = {
  module: Module
}

export default function ModuleFilter({ module }: Props) {
  const form = useForm()

  const selectableFields = useMemo(() => {
    return module.meta?.filter((field) => field.type === FieldType.SELECT)
  }, [module])

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
