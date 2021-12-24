import { User } from 'next-auth'
import { Base } from './base'
import { Contact } from './contact'
import { Deal } from './deal'
import { Lead } from './lead'

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
  status: TaskStatus
  priority: TaskPriority
  lead: Lead | null
  contact: Contact | null
  deal: Deal | null
  dueDate: Date | null
  description: string | null
}