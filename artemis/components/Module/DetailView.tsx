import { notification } from 'antd'
import { capitalize } from 'lodash'
import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useMutation, useQuery  } from 'react-query'

import { DetailNavbar } from '@components/Details/Navbar'
import { DetailSidebar } from '@components/Details/Sidebar'

import Layout from '@utils/components/Layout'
import { useRelationField } from '@utils/hooks/useRelationField'
import { FieldType } from '@utils/models/module'
import { getEntity, updateEntity } from '@utils/service/module'

import Field from './Field'
import { toCapitalizedWords } from './OverviewView'

type TProps = {
  paths: string[]
}

export default function DetailView({ paths }: TProps) {
  const [moduleName, id] = paths

  const { data, refetch } = useQuery(
    [moduleName, id],
    getEntity(moduleName, id),
    {
      enabled: false,
      keepPreviousData: true,
    },
  )

  const entity = data!

  const entityData = entity.data
  const metaData = entity.module.meta || []

  useRelationField(metaData)

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      name: entity?.name,
      ...entityData,
    },
  })

  const { mutateAsync } = useMutation(
    [moduleName, id, 'updated'],
    updateEntity(moduleName, id),
    {
      onSuccess() {
        refetch()
        notification.success({
          message: `Update ${toCapitalizedWords(moduleName)} successfully`,
        })
      },
      onError() {
        notification.error({
          message: `Update ${toCapitalizedWords(
            moduleName,
          ).toLocaleLowerCase()} successfully`,
        })
      },
    },
  )

  const submitEntity = useCallback(
    form.handleSubmit((data) => {
      mutateAsync(data)
    }),
    [],
  )

  return (
    <Layout title={`CRM | ${capitalize(moduleName)} | ${entity?.name}`}>
      <div className="crm-container">
        <DetailNavbar data={entity} />

        <div className="grid grid-cols-[250px,1fr] gap-5">
          <DetailSidebar />

          <div className="flex flex-col gap-4">
            <div>
              <div className="font-semibold mb-4 text-[17px]">Overview</div>

              <form
                onSubmit={submitEntity}
                className="flex flex-col"
                key={JSON.stringify({
                  name: entity?.name,
                  ...entityData,
                })}
              >
                <FormProvider {...form}>
                  <Field
                    data={{
                      group: '',
                      name: 'name',
                      required: false,
                      type: FieldType.TEXT,
                      visibility: { Overview: true, Update: true },
                    }}
                    inlineEdit
                  />

                  {metaData.map((field) => (
                    <Field data={field} key={field.name} inlineEdit />
                  ))}
                </FormProvider>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
