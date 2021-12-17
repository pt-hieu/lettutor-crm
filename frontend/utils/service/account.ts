import { Paginate, PagingQuery } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'
import { Account } from 'next-auth'
import { AccountAddFormData } from 'pages/accounts/add-account'

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

export const addAccount = async (contactInfo: AccountAddFormData) => {
  const { data } = await axios.post<Account>(API + `/api/account`, contactInfo)
  return data
}

export const getAccount = (id?: string, token?: string) => () =>
  axios
    .get<Account>(API + `/api/account/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)
