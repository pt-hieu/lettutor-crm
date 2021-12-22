import { Base } from './base'
import { Contact } from './contact'
import { Deal } from './deal'
import { Lead } from './lead'
import { User } from './user'

export enum TaskStatus {
  DUMMY1 = 'DUMMY1',
  DUMMY2 = 'DUMMY2',
}

export enum TaskPriority {
  DUMMY1 = 'DUMMY1',
  DUMMY2 = 'DUMMY2',
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
