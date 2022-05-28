import moment from 'moment'

import {
  DealReportType,
  LeadReportType,
  StaticTime,
  TReport,
} from '@utils/models/reports'

const DealDescription: Record<DealReportType, string> = {
  [DealReportType.DEALS_CLOSING_THIS_MONTH]: 'Deals closing this month',
  [DealReportType.LOST_DEALS]: 'Deals Lost',
  [DealReportType.OPEN_DEALS]: 'Deals Pending',
  [DealReportType.PIPELINE_BY_PROBABILITY]: 'Deals by Probability',
  [DealReportType.PIPELINE_BY_STAGE]: 'Deals by Stage',
  [DealReportType.SALES_BY_LEAD_SOURCE]:
    'Sales gained from various Lead Sources',
  [DealReportType.SALES_PERSON_PERFORMANCE]: 'Deals gained by salesperson',
  [DealReportType.THIS_MONTH_SALES]: "This Month's Sales",
  [DealReportType.TODAY_SALES]: "Today's Sales",
}

export const DealReports: TReport[] = Object.entries(DealDescription).map(
  ([name, description]) => ({
    name,
    description,
  }),
)

const LeadDescription: Record<LeadReportType, string> = {
  [LeadReportType.CONVERTED_LEADS]:
    'Leads converted to Account / Deal / Contact',
  [LeadReportType.LEADS_BY_OWNERSHIP]: 'Leads by Owner',
  [LeadReportType.LEADS_BY_SOURCE]: 'Leads from various sources',
  [LeadReportType.LEADS_BY_STATUS]: 'Leads and their statuses',
  [LeadReportType.TODAY_LEADS]: 'Leads obtained today',
}

export const LeadReports: TReport[] = Object.entries(LeadDescription).map(
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
    moment().endOf('month').format('yyyy-MM-DD'),
  ],
  [StaticTime.Last12Months]: [
    moment().subtract(12, 'month').startOf('month').format('yyyy-MM-DD'),
    moment().subtract(1, 'month').endOf('month').format('yyyy-MM-DD'),
  ],
  [StaticTime.Next6Months]: [
    moment().add(1, 'month').startOf('month').format('yyyy-MM-DD'),
    moment().add(6, 'month').endOf('month').format('yyyy-MM-DD'),
  ],
  [StaticTime.Next12Months]: [
    moment().add(1, 'month').startOf('month').format('yyyy-MM-DD'),
    moment().add(12, 'month').endOf('month').format('yyyy-MM-DD'),
  ],
}
