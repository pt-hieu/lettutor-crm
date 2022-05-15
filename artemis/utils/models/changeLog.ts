import { StrapiBase } from './base'

export interface ChangeLog extends StrapiBase {
  version: string
  changes: string
  releasedAt: Date
}
