import { Base } from './base'
import { User } from './user'

export type TChange = {
  name: string
  from: string | number
  to: string | number
}

export enum LogSource {
  LEAD = 'lead',
  ACCOUNT = 'account',
  CONTACT = 'contact',
  DEAL = 'deal',
  TASK = 'task',
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
  source: LogSource
  action: LogAction
  changes: TChange[] | null
}
