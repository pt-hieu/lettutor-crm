import { Log, LogAction, LogSource } from '@utils/models/log'
import { Paginate, PagingQuery } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'

export const getLogs =
  (
    params: Partial<{
      source: LogSource
      action: LogAction
      from: Date
      to: Date
      property: string
      owner: string
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
