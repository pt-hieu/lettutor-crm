import { Base } from './base'
import { User } from './user'

export enum LeadSource {
  Advertisement = 'Advertisement',
  ColdCall = 'Cold Call',
}

// export interface Lead extends Base {
//   id: string
//   name: string
//   email: string
//   company: string
//   phone: string
//   leadSource: LeadSource
//   leadOwner: User
// }

export interface Lead {
  id: string
  name: string
  email: string
  company: string
  phone: string
  leadSource: LeadSource
  leadOwner: { name: string }
}
