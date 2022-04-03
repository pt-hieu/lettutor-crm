import { isUUID } from 'class-validator'
import { GetServerSideProps } from 'next'
import { ReactNode, useMemo } from 'react'
import { QueryClient, dehydrate } from 'react-query'

import CreateView from '@components/Module/CreateView'
import DetailView from '@components/Module/DetailView'
import OverviewView from '@components/Module/OverviewView'
import UpdateView from '@components/Module/UpdateView'

import { getSessionToken } from '@utils/libs/getToken'
import { Module } from '@utils/models/module'
import { getEntity, getModules } from '@utils/service/module'
import { getTaskOfEntity } from '@utils/service/task'

enum View {
  UPDATE,
  CREATE,
  DETAIL,
  OVERVIEW,
  NOTFOUND,
}

type Props = {
  render: View
  dehydratedState: any
  module: Module | undefined
  paths: string[]
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  query,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)
  const paths = query.path || []

  let render: View = View.OVERVIEW

  if (paths[1] && isUUID(paths[1])) {
    if (!paths[2]) render = View.DETAIL
    else if (paths[2] === 'update') render = View.UPDATE
    else render = View.NOTFOUND
  }

  if (paths[1] === 'create') render = View.CREATE

  if (paths[3]) {
    render = View.NOTFOUND
  }

  const promises = [client.prefetchQuery('modules', getModules(token))]

  if (render === View.DETAIL)
    promises.push(
      client.prefetchQuery(
        [paths[0], paths[1]],
        getEntity(paths[0], paths[1], token),
      ),
      client.prefetchQuery(
        [paths[0], paths[1], 'tasks'],
        getTaskOfEntity(paths[1], token),
      ),
    )

  await Promise.all(promises)

  const modules = client.getQueryData<Module[]>('modules')
  const currentModule = modules?.find((module) => module.name === paths[0])

  if (!currentModule) render = View.NOTFOUND

  return {
    notFound: render === View.NOTFOUND,
    props: {
      dehydratedState: dehydrate(client),
      render,
      module: currentModule,
      paths: [paths].flat(),
    },
  }
}

export default function DynamicModule({ module, render, paths }: Props) {
  const renderView = useMemo<Record<View, ReactNode>>(
    () => ({
      [View.CREATE]: <CreateView module={module!} />,
      [View.DETAIL]: <DetailView paths={paths} />,
      [View.NOTFOUND]: <></>,
      [View.OVERVIEW]: <OverviewView module={module!} />,
      [View.UPDATE]: <UpdateView />,
    }),
    [module],
  )

  return renderView[render]
}
