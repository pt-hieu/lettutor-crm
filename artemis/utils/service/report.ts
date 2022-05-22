import axios from 'axios'
import { API } from 'environment'

import { Entity } from '@utils/models/module'
import { Paginate, PagingQuery } from '@utils/models/paging'
import { ReportType, TReportFilterData } from '@utils/models/reports'

type TDealReportParams = TReportFilterData & {
  reportType: ReportType
}

export const getDealsReport =
  (moduleName: string, params: TDealReportParams & PagingQuery) => () =>
    axios
      .get<Paginate<Entity>>(
        API + '/apollo/module/entity/report/' + moduleName,
        { params },
      )
      .then((r) => r.data)
