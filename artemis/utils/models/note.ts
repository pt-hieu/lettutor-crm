import { Account } from './account'
import { Base } from './base'
import { Contact } from './contact'
import { Deal } from './deal'
import { Lead } from './lead'
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
  files?: File[]
  source?: NoteSource
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
}
