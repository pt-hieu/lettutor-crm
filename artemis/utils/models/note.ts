import { Account } from './account'
import { Base } from './base'
import { Contact } from './contact'
import { Deal } from './deal'
import { Lead } from './lead'
import { Task } from './task'
import { User } from './user'

export type NoteSource = 'lead' | 'contact' | 'account' | 'deal' | 'task'

export type AddNoteDto = {
  ownerId: string
  dealId?: string
  leadId?: string
  contactId?: string
  accountId?: string
  taskId?: string
  title?: string
  content?: string
  files?: File[]
  source?: NoteSource
}

export interface Attachments extends Base {
  key: string
  location: string
  size: number
}

export interface Note extends Base {
  owner: User | null
  deal: Deal
  title: string
  content: string
  source: NoteSource
  lead?: Lead
  contact?: Contact
  account?: Account
  task?: Task
  attachments: Attachments[]
}
