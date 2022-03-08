import axios from 'axios'
import { API } from 'environment'
import { AccountUpdateFormData } from 'pages/accounts/[id]/edit'
import { AccountAddFormData } from 'pages/accounts/add-account'

import { Account, AccountType } from '@utils/models/account'
import { Paginate, PagingQuery } from '@utils/models/paging'

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
      .get<Paginate<Account>>(API + '/apollo/account', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)

export const getRawAccounts = (token?: string) => () =>
  axios
    .get<Pick<Account, 'id' | 'fullName'>>(API + '/apollo/account/raw', {
      headers: {
        authorization: 'Bearer ' + token,
      },
    })
    .then((res) => res.data)

export const addAccount = async (contactInfo: AccountAddFormData) => {
  const { data } = await axios.post<Account>(
    API + `/apollo/account`,
    contactInfo,
  )
  return data
}

export const getAccount = (id?: string, token?: string) => () =>
  axios
    .get<Account>(API + `/apollo/account/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)

export const updateAccount = async (params: {
  id: string
  accountInfo: AccountUpdateFormData
}) => {
  const { id, accountInfo } = params
  const { data } = await axios.patch<Account>(
    API + `/apollo/account/${id}`,
    accountInfo,
  )

  return data
}

export const batchDelete = (ids: string[]) =>
  axios
    .delete(API + '/apollo/account/batch', { data: { ids } })
    .then((r) => r.data)
