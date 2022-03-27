import { isUUID } from 'class-validator'
import { GetServerSideProps } from 'next'
import { useMemo } from 'react'
import { QueryClient, dehydrate, useQuery } from 'react-query'

import CreateView from '@components/Module/CreateView'
import DetailView from '@components/Module/DetailView'
import OverviewView from '@components/Module/OverviewView'
import UpdateView from '@components/Module/UpdateView'

import { getSessionToken } from '@utils/libs/getToken'
import { getModules } from '@utils/service/module'

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

export default function DynamicModule({ paths }: Props) {
  const { data: modules } = useQuery('modules', getModules(), {
    enabled: false,
  })

  const selectedModule = useMemo(() => {
    return modules?.find((module) => module.name === paths[0])
  }, [modules, paths])

  if (!selectedModule) {
    return <NotFound />
  }

  if (paths[3]) {
    return <NotFound />
  }

  if (paths[1] && isUUID(paths[1])) {
    if (paths[2] === 'update') return <UpdateView />
    if (!paths[2]) return <DetailView />
    return <NotFound />
  }

  if (paths[1] === 'create') return <CreateView module={selectedModule} />

  return <OverviewView module={selectedModule} />
}
