import { isUUID } from 'class-validator'
import { GetServerSideProps } from 'next'
import { useMemo } from 'react'
import { QueryClient, dehydrate, useQuery } from 'react-query'

import CreateView from '@components/Module/CreateView'
import DetailView from '@components/Module/DetailView'
import OverviewView from '@components/Module/OverviewView'
import UpdateView from '@components/Module/UpdateView'

import { getSessionToken } from '@utils/libs/getToken'
import { Entity } from '@utils/models/module'
import { getEntity, getModules } from '@utils/service/module'

import NotFound from './404'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)
  const paths = query.path

  await client.prefetchQuery('modules', getModules(token))

  return {
    props: {
      dehydratedState: dehydrate(client),
      paths,
    },
  }
}

type Props = {
  paths: string[]
}

enum ModuleAction {
  CREATE = 'create',
  UPDATE = 'update',
}

export default function DynamicModule({ paths }: Props) {
  const moduleName = paths[0]
  const moduleId = paths[1]
  const moduleAction = paths[2]
  const isInvalidPath = paths[3]

  const { data: modules } = useQuery('modules', getModules(), {
    enabled: false,
  })

  const { data: moduleEntity } = useQuery(
    [moduleName, moduleId],
    getEntity(moduleName, moduleId),
  )

  const selectedModule = useMemo(() => {
    return modules?.find((module) => module.name === moduleName)
  }, [modules, paths])

  if (!selectedModule) {
    return <NotFound />
  }

  if (isInvalidPath) {
    return <NotFound />
  }

  if (moduleId && isUUID(moduleId)) {
    if (moduleAction === ModuleAction.UPDATE)
      return (
        <UpdateView module={selectedModule} entity={moduleEntity as Entity} />
      )

    if (!moduleAction) return <DetailView paths={paths} />

    return <NotFound />
  }

  if (moduleAction === ModuleAction.CREATE)
    return <CreateView module={selectedModule} />

  return <OverviewView module={selectedModule} />
}
