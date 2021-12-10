import { Deal } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'
import { Paginate, PagingQuery } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'

export const getDeals =
  (
    params: {
      search?: string
      source?: LeadSource[]
    } & PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<Paginate<Deal>>(API + '/api/deal', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)
