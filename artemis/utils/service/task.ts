import { Paginate, PagingQuery } from '@utils/models/paging'
import { Task, TaskPriority, TaskStatus } from '@utils/models/task'
import { API } from 'environment'
import axios from 'axios'

export const getTasks =
  (
    params: {
      search?: string
      status?: TaskStatus[]
      priority?: TaskPriority[]
    } & PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<Paginate<Task>>(API + '/api/task', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)
