import { Base } from './base'
import { Deal } from './deal'
import { Lead } from './lead'
import { Task } from './task'
import { User } from './user'

export enum AccountType {
  NONE = 'None',
  ANALYST = 'Analyst',
  COMPETITOR = 'Competitor',
  CUSTOMER = 'Customer',
  DISTRIBUTOR = 'Distributor',
  INTEGRATOR = 'Integrator',
  INVESTOR = 'Investor',
  OTHER = 'Other',
  PARTNER = 'Partner',
  PRESS = 'Press',
  PROSPECT = 'Prospect',
  RESELLER = 'Reseller',
  VENDOR = 'Vendor',
}

export interface Account extends Base {
  owner: User | null
  fullName: string
  type: AccountType
  address: string | null
  description: string | null
  phoneNum: string | null
  contacts: Lead[]
  deals: Deal[]
  tasks: Task[]
}
