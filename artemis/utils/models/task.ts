import { Base } from './base'
import { Contact } from './contact'
import { Deal } from './deal'
import { Lead } from './lead'
import { User } from './user'

export enum TaskPriority {
  HIGH = 'High',
  HIGHEST = 'Highest',
  LOW = 'Low',
  LOWEST = 'Lowest',
  NORMAL = 'Normal',
}

export enum TaskStatus {
  NOT_STARTED = 'Not Started',
  DEFERRED = 'Deferred',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  WAITING_FOR_INPUT = 'Waiting For Input',
}

export interface Task extends Base {
  owner: User
  subject: string
  dueDate?: Date
  lead?: Lead
  contact?: Contact
  account?: Account
  deal?: Deal
  status: TaskStatus
  priority: TaskPriority
  description?: string
}
