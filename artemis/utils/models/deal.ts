import { Account } from './account'
import { Base } from './base'
import { Contact } from './contact'
import { LeadSource } from './lead'
import { Task } from './task'
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

export type LossStages =
  | DealStage.CLOSED_LOST
  | DealStage.CLOSED_LOST_TO_COMPETITION

export interface Deal extends Base {
  owner: User | null
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
  tasks: Task[]
}

export type UpdateDealDto = {
  ownerId?: string
  accountId?: string
  contactId?: string | null
  fullName?: string
  amount?: number | null
  closingDate?: Date
  stage?: string
  source?: LeadSource
  probability?: number | null
  description?: string | null
  reasonForLoss?: string | null
}
