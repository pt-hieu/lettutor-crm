import { ReportType, TReport } from '@utils/models/reports'

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
