import { Deal } from './deal'
import { Lead } from './lead'

export interface Contact extends Lead {
  deals: Deal[]
}
