import { Account } from './account'
import { Base } from './base'
import { Contact } from './contact'
import { Deal } from './deal'
import { Lead } from './lead'
import { User } from './user'

export enum TaskPriority {
  HIGHEST = 'Highest',
  HIGH = 'High',
  NORMAL = 'Normal',
  LOW = 'Low',
  LOWEST = 'Lowest',
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
  status: TaskStatus
  priority: TaskPriority
  lead: Lead | null
  contact: Contact | null
  account: Account | null
  deal: Deal | null
  dueDate: Date | null
  description: string | null
  fullName?: string
}
