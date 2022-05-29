import { Base } from './base'
import { Attachments } from './note'

export enum FeedType {
  Status = 'Status',
  // Deals = 'Deals',
}

export enum FeedTime {
  Now = 'Now',
  Yesterday = 'Yesterday',
  LastWeek = 'Last Week',
  CurrentMonth = 'Current Month',
  LastMonth = 'Last Month',
}

export type AddStatusDto = {
  files?: File[]
  ownerId: string
  content: string
}

export interface FeedStatus extends Base {
  attachments?: Attachments[]
  owner: {
    name: string
    email: string
  }
  content: string
}

export interface FeedComment extends FeedStatus {
  statusId: string
}
export interface AddCommentDto extends AddStatusDto {
  statusId: string
}
