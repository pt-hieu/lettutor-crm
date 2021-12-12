import { LeadSource } from '@utils/models/lead'
import { Paginate, PagingQuery } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'
import { Account } from 'next-auth'

export const getAccounts =
  (
    params: {
      search?: string
      source?: LeadSource[]
    } & PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<Paginate<Account>>(API + '/api/account', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)
