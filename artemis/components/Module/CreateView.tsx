import { notification } from 'antd'
import { capitalize } from 'lodash'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'

import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'
import { FieldMeta, FieldType, Module } from '@utils/models/module'
import { createEntity } from '@utils/service/module'
import { getRawUsers } from '@utils/service/user'

import Field from './Field'

type Props = {
  module: Module
}

export default function CreateView({ module }: Props) {
  const { push } = useRouter()

  const form = useForm()
  const client = useQueryClient()

  useEffect(() => {
    const relationNames = new Set(
      module.meta
        ?.filter(
          (field) => !!field.relateTo && field.type === FieldType.RELATION,
        )
        .map((field) => field.relateTo!) || [],
    )

    relationNames.forEach((name) => {
      if (name === 'User') {
        getRawUsers()().then((users) => {
          client.setQueryData(['relation-data', name], users)
        })
      }
    })
  }, [])

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
            {Object.entries(parsedMeta).map(([groupName, fields]) => (
              <div className="flex flex-col gap-6" key={groupName}>
                <div className="font-semibold text-lg text-gray-700">
                  {groupName}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {fields.map((field) => (
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
