import { PagingQuery } from '@utils/models/paging'
import { Role } from '@utils/models/role'
import axios from 'axios'
import { API } from 'environment'

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
  (id: string) => (data: { name?: string; actions?: string[] }) =>
    axios.patch(API + '/apollo/role/' + id, data).then((res) => res.data)

export const createRole = (data: Pick<Role, 'actions' | 'name'>) =>
  axios.post(API + '/apollo/role', data).then((res) => res.data)

export const deleteRole = (id: string) => () =>
  axios.delete(API + '/apollo/role/' + id).then((res) => res.data)

export const restore = (id: string) =>
  axios.post(API + '/apollo/role/' + id + '/default').then((res) => res.data)
