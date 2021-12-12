import { PagingQuery } from '@utils/models/paging'
import { Actions, Role } from '@utils/models/role'
import axios from 'axios'
import { API } from 'environment'

export const getRoles =
  <T>(params: {} & PagingQuery, token?: string) =>
  () =>
    axios
      .get<T>(API + '/api/role', {
        params,
        headers: {
          authorization: 'Bearer ' + token,
        },
      })
      .then((res) => res.data)

export const updateRole =
  (id: string) => (data: { name?: string; actions?: Actions[] }) =>
    axios.patch(API + '/api/role/' + id, data).then((res) => res.data)

export const createRole = (data: Pick<Role, 'actions' | 'name'>) =>
  axios.post(API + '/api/role', data).then((res) => res.data)
