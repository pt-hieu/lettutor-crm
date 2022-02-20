import { Base } from './base'
import { Deal } from './deal'
import { User } from './user'

export type NoteSource = 'lead' | 'contact' | 'account' | 'deal'

export type AddNoteDto = {
  ownerId: string
  dealId?: string
  leadId?: string
  contactId?: string
  accountId?: string
  title?: string
  content?: string
  source?: NoteSource
}

export interface Note extends Base {
  owner: User | null
  deal: Deal
  title: string
  content: string
}
