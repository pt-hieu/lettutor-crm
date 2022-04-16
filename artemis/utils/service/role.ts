import axios from 'axios'
import { API } from 'environment'

import { PagingQuery } from '@utils/models/paging'
import { Action } from '@utils/models/role'

export const getRoles =
  <T>(params: {} & PagingQuery, token?: string) =>
  () =>
    axios
      .get<T>(API + '/apollo/role', {
        params,
        headers: {
          authorization: 'Bearer ' + token,
        },
      })
      .then((res) => res.data)

export const updateRole =
  (id: string) => (data: { name?: string; actionsId?: string[] }) =>
    axios.patch(API + '/apollo/role/' + id, data).then((res) => res.data)

export const createRole = (data: { name: string; actionsId: string[] }) =>
  axios.post(API + '/apollo/role', data).then((res) => res.data)

export const deleteRole = (id: string) => () =>
  axios.delete(API + '/apollo/role/' + id).then((res) => res.data)

export const restore = (id: string) =>
  axios.post(API + '/apollo/role/' + id + '/default').then((res) => res.data)

export const getActions = (token?: string) => () =>
  axios
    .get<Action[]>(API + '/apollo/action', {
      headers: {
        authorization: 'Bearer ' + token,
      },
    })
    .then((res) => res.data)
