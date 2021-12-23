import { Task } from '@utils/models/task'
import axios from 'axios'
import { API } from 'environment'
import { TaskAddFormData } from 'pages/tasks/add-task'

export const addTask = async (taskInfo: TaskAddFormData) => {
  const { data } = await axios.post<Task>(API + `/api/task`, taskInfo)
  return data
}
