import { Paginate, PagingQuery } from '@utils/models/paging'
import { Task, TaskPriority, TaskStatus } from '@utils/models/task'
import { API } from 'environment'
import axios from 'axios'
import { TaskAddFormData } from 'pages/tasks/add-task'

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

export const getTask = (id?: string, token?: string) => () =>
  axios
    .get<Task>(API + `/api/task/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)

export const addTask = async (taskInfo: TaskAddFormData) => {
  const { data } = await axios.post<Task>(API + `/api/task`, taskInfo)
  return data
}
