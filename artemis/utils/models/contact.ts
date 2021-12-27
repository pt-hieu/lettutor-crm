import { Deal } from './deal'
import { Lead } from './lead'
import { Task } from './task'

export interface Contact extends Lead {
  deals: Deal[]
  tasksOfContact: Task[]
}
