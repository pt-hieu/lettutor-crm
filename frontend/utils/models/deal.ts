import { Account } from './account'
import { Base } from './base'
import { Contact } from './contact'
import { LeadSource } from './lead'
import { User } from './user'

export enum DealStage {
  AUTHENTICATION = 'Authentication',
  NEED_ANALYSIS = 'Need Analysis',
  VALUE_PROPOSITION = 'Value Proposition',
  SUBMIT_ESTIMATE_PRICE = 'Submit Estimate / Price',
  NEGOTIATE_REVIEW = 'Negotiate / Review',
  ENDED_SUCCESSFULLY = 'Ended Successfully',
  SKIP_THE_ENDING = 'Skip The Ending',
  ENDED_LOST_COMPLETELY = 'Ended - Lost Completely',
}

export interface Deal extends Base {
  owner: User
  ownerId: string
  account: Account
  contact: Contact
  fullName: string
  amount: number | null
  closingDate: Date
  stage: DealStage
  source: LeadSource
  probability: number
  description: string | null
}
