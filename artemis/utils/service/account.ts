import { AccountType, Account } from '@utils/models/account'
import { Paginate, PagingQuery } from '@utils/models/paging'
import axios from 'axios'
import { API } from 'environment'
import { AccountAddFormData } from 'pages/accounts/add-account'
import { AccountUpdateFormData } from 'pages/accounts/[id]/edit'

export const getAccounts =
  (
    params: {
      search?: string
      type?: AccountType[]
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

export const getRawAccounts = (token?: string) => () =>
  axios
    .get<Pick<Account, 'id' | 'fullName'>>(API + '/api/account/raw', {
      headers: {
        authorization: 'Bearer ' + token,
      },
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

export const updateAccount = async (params: {
  id: string
  accountInfo: AccountUpdateFormData
}) => {
  const { id, accountInfo } = params
  const { data } = await axios.patch<Account>(
    API + `/api/account/${id}`,
    accountInfo,
  )

  return data
}
