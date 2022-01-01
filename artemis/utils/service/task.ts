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
      isOpen?: Boolean
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

export const getTask = (id?: string, token?: string) => () =>
  axios
    .get<Task>(API + `/api/task/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)

export const addTask = async (taskInfo: TaskFormData) => {
  const { data } = await axios.post<Task>(API + `/api/task`, taskInfo)
  return data
}

export const updateTask = (id: string) => (data: TaskFormData) =>
  axios.patch(API + '/api/task/' + id, data).then((res) => res.data)

export const closeTask = (id: string, ownerId: string) => () =>
  axios
    .patch(API + '/api/task/' + id, { status: TaskStatus.COMPLETED, ownerId })
    .then((res) => res.data)
