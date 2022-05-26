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

export interface Feed {
  type: FeedType
  action: string
  time: Date
  content: string
  owner: {
    id: string
    name: string
  }
  files?: { name: string; id: string }[]
}
