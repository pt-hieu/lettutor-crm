import { Base } from './base'
import { User } from './user'

export type TChange = {
  name: string
  from: string | number
  fromName?: string
  to: string | number
  toName?: string
}

export enum LogSource {
  LEAD = 'lead',
  ACCOUNT = 'account',
  CONTACT = 'contact',
  DEAL = 'deal',
  TASK = 'task',
  NOTE = 'note',
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface Log extends Base {
  owner: User | null
  entityId: string
  entityName: string
  deleted: boolean
  source: LogSource
  action: LogAction
  changes: TChange[] | null
}
