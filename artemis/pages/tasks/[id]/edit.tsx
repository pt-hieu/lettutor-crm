import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { QueryClient, dehydrate, useQuery } from 'react-query'

import { getSessionToken } from '@utils/libs/getToken'
import { getEntityForTaskCreate } from '@utils/service/module'
import { getRelation, getTask } from '@utils/service/task'
import { getRawUsers } from '@utils/service/user'

import CreateTaskPage from '../create'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)
  const id = params?.id as string

  await Promise.all([
    client.prefetchQuery(['task', id], getTask(id, token)),
    client.prefetchQuery(['task', id, 'relations'], getRelation(id, token)),
    client.prefetchQuery('raw-users', getRawUsers(token)),
    client.prefetchQuery(
      'raw-entity-task-create',
      getEntityForTaskCreate(token),
    ),
  ])

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default function UpdateTaskView() {
  const { query } = useRouter()
  const id = query.id as string

  const { data: task } = useQuery(['task', id], getTask(id), { enabled: false })
  const { data: relations } = useQuery(
    ['task', id, 'relations'],
    getRelation(id),
    { enabled: false, select: (items) => items.map((i) => i.id) },
  )

  return <CreateTaskPage task={task} entityIds={relations} />
}
