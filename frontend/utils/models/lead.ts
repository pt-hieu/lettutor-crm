import { Base } from './base'
import { User } from './user'

export enum LeadStatus {
  NONE = 'None',
  TRIED_CONTACTING = 'Tried Contacting',
  CONTACT_IN_THE_FUTURE = 'Contact In The Future',
  CONTACTED = 'Contacted',
  NOT_CONTACTED_YET = 'Not Contacted Yet',
  OFFER_SOMETHING = 'Offer Something',
  OFFER_LOST = 'Offer Lost',
  DEFINE_PRECONDITION = 'Define Precondition',
  NOT_ELIGIBLE = 'Not Eligible',
}

export enum LeadSource {
  NONE = 'None',
  FACEBOOK = 'Facebook',
  LET_TUTOR = 'Let Tutor',
  GOOGLE = 'Google',
}

export interface Lead extends Base {
  owner: User
  fullName: string
  email: string
  status: LeadStatus
  source: LeadSource
  isLead: boolean
  address: string | null
  description: string | null
  phoneNum: string | null
  socialAccount: string | null
}
