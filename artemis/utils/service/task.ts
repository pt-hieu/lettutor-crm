import { Paginate, PagingQuery } from '@utils/models/paging'
import { Task, TaskPriority, TaskStatus } from '@utils/models/task'
import { API } from 'environment'
import axios from 'axios'
import { TaskFormData } from 'pages/tasks/add-task'

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
      .get<Paginate<Task>>(API + '/apollo/task', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)

export const getTask = (id?: string, token?: string) => () =>
  axios
    .get<Task>(API + `/apollo/task/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)

export const addTask = async (taskInfo: TaskFormData) => {
  const { data } = await axios.post<Task>(API + `/apollo/task`, taskInfo)
  return data
}

export const getRawTasks = (token?: string) => () =>
  axios
    .get<Pick<Task, 'id' | 'subject'>[]>(API + '/apollo/task/raw', {
      headers: {
        authorization: 'Bearer ' + token,
      },
    })
    .then((res) => res.data)

export const updateTask = (id: string) => (data: TaskFormData) =>
  axios.patch(API + '/apollo/task/' + id, data).then((res) => res.data)

export const closeTask = (id: string, ownerId: string) => () =>
  axios
    .patch(API + '/apollo/task/' + id, {
      status: TaskStatus.COMPLETED,
      ownerId,
    })
    .then((res) => res.data)

export const batchDelete = (ids: string[]) =>
  axios
    .delete(API + '/apollo/task/batch', { data: { ids } })
    .then((r) => r.data)
