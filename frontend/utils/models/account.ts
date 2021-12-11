import { Base } from './base'
import { Deal } from './deal';
import { Lead } from './lead';
import { User } from './user';

export interface Account extends Base {
  owner: User
  fullName: string
  address: string | null
  description: string | null
  phoneNum: string | null
  contacts: Lead[]
  deals: Deal[]
}
