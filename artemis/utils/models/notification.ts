import { Base } from './base'

export interface Notification extends Base {
  message: string
  read: boolean
}
