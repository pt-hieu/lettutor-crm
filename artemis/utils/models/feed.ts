export enum FeedType {
  Status = 'Status',
  Deals = 'Deals',
  Tasks = 'Tasks',
}

export enum FeedTime {
  Yesterday = 'Yesterday',
  LastWeek = 'Last Week',
  CurrentMonth = 'Current Month',
  LastMonth = 'Last Month',
}

export interface FeedComment {
  owner: {
    id: string
    name: string
  }
  content: string
  createdAt: Date
  files?: { filename: string; id: string }[]
}
export interface Feed {
  type: FeedType
  action: string
  time: Date
  content: string
  owner: {
    id: string
    name: string
  }
  files?: { filename: string; id: string }[]
  comments?: FeedComment[]
}
