import { Account } from './account'
import { Base } from './base'
import { Task } from './task'
import { User } from './user'

export enum LeadStatus {
  NONE = 'None',
  ATTEMPTED_TO_CONTACT = 'Attempted To Contact',
  CONTACT_IN_FUTURE = 'Contact In Future',
  CONTACTED = 'Contacted',
  JUNK_LEAD = 'Junk Lead',
  LOST_LEAD = 'Lost Lead',
  NOT_CONTACTED = 'Not Contacted',
  PRE_QUALIFIED = 'Pre Qualified',
  NOT_QUALIFIED = 'Not Qualified',
}

export enum LeadSource {
  NONE = 'None',
  FACEBOOK = 'Facebook',
  LET_TUTOR = 'Let Tutor',
  GOOGLE = 'Google',
}

export interface Lead extends Base {
  owner: User | null
  fullName: string
  account: Account
  email: string
  status: LeadStatus
  source: LeadSource
  isLead: boolean
  address: string | null
  description: string | null
  phoneNum: string | null
  socialAccount: string | null
  tasks: Task[]
}
