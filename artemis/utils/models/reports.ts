export enum ReportType {
  TODAY_SALES = 'Today Sales',
  THIS_MONTH_SALES = 'This Month Sales',
  SALES_BY_LEAD_SOURCE = 'Sales by Lead Source',
  PIPELINE_BY_STAGE = 'Pipeline By Stage',
  PIPELINE_BY_PROBABILITY = 'Pipeline By Probability',
  OPEN_DEALS = 'Open Deals',
  LOST_DEALS = 'Lost Deals',
  DEALS_CLOSING_THIS_MONTH = 'Deals Closing This Month',
  SALES_PERSON_PERFORMANCE = 'Sales Person Performance',
}

export enum TimeFieldName {
  CLOSING_DATE = 'closingDate',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum TimeFieldType {
  EXACT = 'Exact',
  IS_BEFORE = 'Is Before',
  IS_AFTER = 'Is After',
  BETWEEN = 'Between',
}

export enum StaticTime {
  Yesterday = 'Yesterday',
  Today = 'Today',
  Tomorrow = 'Tomorrow',
  LastWeek = 'Last Week',
  CurrentWeek = 'Current Week',
  NextWeek = 'Next Week',
  LastMonth = 'Last Month',
  CurrentMonth = 'Current Month',
  NextMonth = 'Next Month',
  Last6Months = 'Last 6 Months',
  Last12Months = 'Last 12 Months',
  Next6Months = 'Next 6 Months',
  Next12Months = 'Next 12 Months',
}

export type TReport = {
  name: string
  description: string
}

export type TReportFilterData = {
  timeFieldName?: string
  timeFieldType?: string
  startDate?: Date | string
  endDate?: Date | string
  singleDate?: Date | string
}
