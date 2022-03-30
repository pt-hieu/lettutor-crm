import { capitalize } from 'lodash'
import { GetServerSideProps } from 'next'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { QueryClient, dehydrate, useQuery } from 'react-query'

import { DetailNavbar } from '@components/Details/Navbar'
import { DetailSidebar } from '@components/Details/Sidebar'

import InlineEdit from '@utils/components/InlineEdit'
import { Props } from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import { getSessionToken } from '@utils/libs/getToken'
import { getEntity } from '@utils/service/module'
import { getRawUsers } from '@utils/service/user'

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
  const { data: entity } = useQuery([moduleName, id], getEntity(moduleName, id))
  const { data: users } = useQuery('users', getRawUsers())

  const entityData = entity?.data || {}
  const metaData = entity?.module.meta || []

  const {
    register,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  })

  const entityInfo: EntityInfo[] = metaData.map(
    ({ name, options, required, type }) => ({
      label: toCapitalizedWords(name.replace('Id', '')),
      props: {
        as: type === 'Select' || type === 'Relation' ? 'select' : 'input',
        error: errors[name]?.message,
        props: {
          //TODO: need to refactor in the future
          children: options ? (
            <>
              {options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </>
          ) : name === 'ownerId' ? (
            <>
              {users?.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </>
          ) : undefined,
          ...register(name, { required }),
          id: name,
        },
      },
    }),
  )

  useEffect(() => {
    reset(entityData)
  }, [entityData])

  return (
    <Layout title={`CRM | ${capitalize(moduleName)} | ${entity?.name}`}>
      <div className="crm-container">
        <DetailNavbar data={entity} />

        <div className="grid grid-cols-[250px,1fr]">
          <DetailSidebar />

          <div className="flex flex-col gap-4 ml-5">
            <div>
              <div className="font-semibold mb-4 text-[17px]">Overview</div>
              <form onSubmit={() => {}} className="flex flex-col gap-4">
                {entityInfo.map(({ label, props }) => (
                  <div key={label} className="grid grid-cols-[250px,1fr] gap-4">
                    <span className="inline-block text-right font-medium pt-[10px]">
                      {label}
                    </span>

                    <InlineEdit
                      onEditCancel={() => {}}
                      onEditComplete={() => {}}
                      {...props}
                    />
                  </div>
                ))}
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)
  const paths = query.path
  const [moduleName, id] = paths || []

  await Promise.all([
    client.prefetchQuery([moduleName, id], getEntity(moduleName, id, token)),
    client.prefetchQuery('users', getRawUsers(token)),
  ])

  return {
    props: {
      dehydratedState: dehydrate(client),
      paths,
    },
  }
}
