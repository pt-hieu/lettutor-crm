import { Task } from '@utils/models/task'
import axios from 'axios'
import { API } from 'environment'
import { TaskFormData } from 'pages/tasks/add-task'

export const addTask = async (taskInfo: TaskFormData) => {
  const { data } = await axios.post<Task>(API + `/api/task`, taskInfo)
  return data
}

export const updateTask = (id: string) => (data: TaskFormData) =>
  axios.patch(API + '/api/task/' + id, data).then((res) => res.data)

export const getTask = (id: string, token?: string) => () =>
  axios
    .get(API + '/api/task/' + id, {
      headers: { authorization: 'Bearer ' + token },
    })
    .then((res) => res.data)
