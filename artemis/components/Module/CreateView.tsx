import { notification } from 'antd'
import { capitalize } from 'lodash'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useMutation } from 'react-query'

import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'
import { useRelationField } from '@utils/hooks/useRelationField'
import { FieldMeta, FieldType, Module } from '@utils/models/module'
import { createEntity } from '@utils/service/module'

import Field from './Field'

type Props = {
  module: Module
}

export default function CreateView({ module }: Props) {
  const { push } = useRouter()

  const form = useForm()
  useRelationField(module.meta)

  const { isLoading, mutateAsync } = useMutation(
    ['created-entity', module.name],
    createEntity(module.name),
    {
      onSuccess: (res) => {
        notification.success({
          message: 'Create successfully.',
        })
        push(`/${module.name}/${res.id}`)
      },
      onError: () => {
        notification.error({ message: 'Create unsuccessfully.' })
      },
    },
  )

  const parsedMeta = useMemo(
    () =>
      module.meta?.reduce(
        (sum, curr) => ({
          ...sum,
          [curr.group]: (sum[curr.group] || []).concat(curr),
        }),
        {} as Record<string, FieldMeta[]>,
      ) || {},
    [module],
  )

  const submitData = useCallback(
    form.handleSubmit((data) => {
      mutateAsync(data)
    }),
    [],
  )

  return (
    <Layout title={`CRM | Create ${capitalize(module.name)}`}>
      <form
        noValidate
        className="crm-container grid grid-cols-[1fr,220px] gap-4 pt-6"
        onSubmit={submitData}
      >
        <div>
          <FormProvider {...form}>
            {Object.entries(parsedMeta).map(([groupName, fields], index) => (
              <div className="flex flex-col gap-6" key={groupName}>
                <div className="font-semibold text-lg text-gray-700">
                  {groupName}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {!index && (
                    <Field
                      data={{
                        name: 'name',
                        group: groupName,
                        required: true,
                        visibility: { Overview: true, Update: true },
                        type: FieldType.TEXT,
                      }}
                    />
                  )}

                  {fields
                    .filter((field) => !!field.visibility.Create)
                    .map((field) => (
                      <Field data={field} key={field.name} />
                    ))}
                </div>
              </div>
            ))}
          </FormProvider>
        </div>

        <div className="flex justify-end sticky top-[72px] gap-3 max-h-[40px]">
          <button
            type="button"
            className="crm-button-outline"
            onClick={() => push(`/${module.name}`)}
          >
            <span className="fa fa-times mr-2" />
            Cancel
          </button>

          <button
            type="submit"
            className="crm-button"
            onClick={submitData}
            disabled={isLoading}
          >
            <Loading on={isLoading}>
              <span className="fa fa-plus mr-2" />
              Create
            </Loading>
          </button>
        </div>
      </form>
    </Layout>
  )
}
