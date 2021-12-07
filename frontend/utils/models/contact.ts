import { Lead } from './lead'

export interface Contact extends Omit<Lead, 'status'> {
  accountName: string
}
