import axios from 'axios'
import { API } from 'environment'

import { Entity } from '@utils/models/module'
import { Paginate, PagingQuery } from '@utils/models/paging'
import { ReportType, TReportFilterData } from '@utils/models/reports'

type TDealReportParams = TReportFilterData & {
  reportType: ReportType
}

export const getDealsReport = (params: TDealReportParams & PagingQuery) => () =>
  axios
    .get<Paginate<Entity>>(API + '/apollo/module/entity/report/', { params })
    .then((r) => r.data)
