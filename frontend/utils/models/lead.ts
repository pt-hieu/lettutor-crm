import { Base } from './base'
import { User } from './user'

export enum LeadSource {
  Advertisement = 'Advertisement',
  ColdCall = 'Cold Call',
}

export interface Lead extends Base {
  name: string
  email: string
  company: string
  phone: string
  leadSource: LeadSource
  leadOwner: User
}
