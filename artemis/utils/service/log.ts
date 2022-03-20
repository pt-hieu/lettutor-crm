import axios from 'axios'
import { API } from 'environment'

import { Log, LogAction, LogSource } from '@utils/models/log'
import { Paginate, PagingQuery } from '@utils/models/paging'

export const getLogs =
  (
    params: Partial<{
      source: LogSource[] | LogSource
      action: LogAction
      from: Date
      to: Date
      property: string
      owner: string
      entities: string[] | string
    }> &
      PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<Paginate<Log>>(API + '/apollo/log', {
        params,
        headers: {
          authorization: 'Bearer ' + token,
        },
      })
      .then((r) => r.data)
