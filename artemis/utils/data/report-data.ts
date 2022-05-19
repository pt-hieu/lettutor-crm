import moment from 'moment'

import { ReportType, StaticTime, TReport } from '@utils/models/reports'

const DealDescription: Record<ReportType, string> = {
  [ReportType.DEALS_CLOSING_THIS_MONTH]: 'Deals closing this month',
  [ReportType.LOST_DEALS]: 'Deals Lost',
  [ReportType.OPEN_DEALS]: 'Deals Pending',
  [ReportType.PIPELINE_BY_PROBABILITY]: 'Deals by Probability',
  [ReportType.PIPELINE_BY_STAGE]: 'Deals by Stage',
  [ReportType.SALES_BY_LEAD_SOURCE]: 'Sales gained from various Lead Sources',
  [ReportType.SALES_PERSON_PERFORMANCE]: 'Deals gained by salesperson',
  [ReportType.THIS_MONTH_SALES]: "This Month's Sales",
  [ReportType.TODAY_SALES]: "Today's Sales",
}

export const DealReports: TReport[] = Object.entries(DealDescription).map(
  ([name, description]) => ({
    name,
    description,
  }),
)

export const StaticDateByType: Record<StaticTime, string | [string, string]> = {
  [StaticTime.Yesterday]: moment().subtract(1, 'day').format('yyyy-MM-DD'),
  [StaticTime.Today]: moment().format('yyyy-MM-DD'),
  [StaticTime.Tomorrow]: moment().add(1, 'day').format('yyyy-MM-DD'),
  [StaticTime.LastWeek]: [
    moment().subtract(1, 'week').startOf('week').format('yyyy-MM-DD'),
    moment().subtract(1, 'week').endOf('week').format('yyyy-MM-DD'),
  ],
  [StaticTime.CurrentWeek]: [
    moment().startOf('week').format('yyyy-MM-DD'),
    moment().endOf('week').format('yyyy-MM-DD'),
  ],
  [StaticTime.NextWeek]: [
    moment().add(1, 'week').startOf('week').format('yyyy-MM-DD'),
    moment().add(1, 'week').endOf('week').format('yyyy-MM-DD'),
  ],
  [StaticTime.LastMonth]: [
    moment().subtract(1, 'month').startOf('month').format('yyyy-MM-DD'),
    moment().subtract(1, 'month').endOf('month').format('yyyy-MM-DD'),
  ],
  [StaticTime.CurrentMonth]: [
    moment().startOf('month').format('yyyy-MM-DD'),
    moment().endOf('month').format('yyyy-MM-DD'),
  ],
  [StaticTime.NextMonth]: [
    moment().add(1, 'month').startOf('month').format('yyyy-MM-DD'),
    moment().add(1, 'month').endOf('month').format('yyyy-MM-DD'),
  ],
  [StaticTime.Last6Months]: [
    moment().subtract(6, 'month').startOf('month').format('yyyy-MM-DD'),
    moment().subtract(6, 'month').endOf('month').format('yyyy-MM-DD'),
  ],
  [StaticTime.Last12Months]: [
    moment().subtract(12, 'month').startOf('month').format('yyyy-MM-DD'),
    moment().subtract(12, 'month').endOf('month').format('yyyy-MM-DD'),
  ],
  [StaticTime.Next6Months]: [
    moment().add(6, 'month').startOf('month').format('yyyy-MM-DD'),
    moment().add(6, 'month').endOf('month').format('yyyy-MM-DD'),
  ],
  [StaticTime.Next12Months]: [
    moment().add(12, 'month').startOf('month').format('yyyy-MM-DD'),
    moment().add(12, 'month').endOf('month').format('yyyy-MM-DD'),
  ],
}
