import { Paginate, PagingQuery } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'

export const getAccounts =
  (
    params: {
      search?: string
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
