import { Account } from './account'
import { Base } from './base'
import { Contact } from './contact'
import { LeadSource } from './lead'
import { User } from './user'

export enum DealStage {
  QUALIFICATION = 'Qualification',
  NEEDS_ANALYSIS = 'Needs Analysis',
  VALUE_PROPOSITION = 'Value Proposition',
  IDENTIFY_DECISION_MAKERS = 'Identify Decision Makers',
  PROPOSAL_PRICE_QUOTE = 'Proposal/Price Quote',
  NEGOTIATION_REVIEW = 'Negotiation/Review',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost',
  CLOSED_LOST_TO_COMPETITION = 'Closed-Lost To Competition',
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
