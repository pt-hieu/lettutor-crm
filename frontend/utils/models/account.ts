import { Base } from './base'
import { Lead } from './lead';

export interface Account extends Base {
  ownerId: string
  fullName: string
  email: string
  address: string | null
  description: string | null
  phoneNum: string | null
  contacts: Lead[]
}
