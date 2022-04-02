import { capitalize } from 'lodash'
import { useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useQuery } from 'react-query'

import { DetailNavbar } from '@components/Details/Navbar'
import { DetailSidebar } from '@components/Details/Sidebar'

import InlineEdit from '@utils/components/InlineEdit'
import { Props } from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import { useRelationField } from '@utils/hooks/useRelationField'
import { FieldMeta, FieldType } from '@utils/models/module'
import { getEntity } from '@utils/service/module'
import { getRawUsers } from '@utils/service/user'

import Field from './Field'
import { toCapitalizedWords } from './OverviewView'

type TProps = {
  paths: string[]
}

type EntityInfo = {
  label: string
  props: Omit<Props<'input' | 'textarea' | 'select' | undefined>, 'editable'>
}

export default function DetailView({ paths }: TProps) {
  const [moduleName, id] = paths

  const { data } = useQuery([moduleName, id], getEntity(moduleName, id), {
    enabled: false,
    keepPreviousData: true,
  })

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

  // useEffect(() => {
  //   form.reset({ name: entity?.name, ...entityData })
  // }, [entityData, entity])

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
                onSubmit={(e) => {
                  e.preventDefault()
                }}
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
