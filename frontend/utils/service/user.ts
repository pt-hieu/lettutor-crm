import { Paginate, PagingQuery } from '@utils/models/paging'
import { Role } from '@utils/models/role'
import { User, UserStatus } from '@utils/models/user'
import axios from 'axios'
import { API } from 'environment'

export const requestResetEmail = (data: { email: string }) =>
  axios.post(API + '/api/user/reset-password', data)

export const updatePassword = (data: { token: string; password: string }) =>
  axios.put(API + '/api/user/password', data)

export const changePassword = async (data: {
  oldPassword: string
  newPassword: string
}) =>
  axios.patch(API + '/api/user/change-password', data).then((res) => res.data)

export const getSelf = (token?: string) => () =>
  axios
    .get<Pick<User, 'name' | 'email' | 'status' | 'roles'>>(
      API + '/api/user/self',
      {
        headers: { authorization: 'Bearer ' + token },
      },
    )
    .then((res) => res.data)

export const updateUserInformation = (data: { name: string }) =>
  axios.patch<User>(API + '/api/user', data).then((res) => res.data)

export const getUsers =
  (
    params: {
      search?: string
      status?: UserStatus
      role?: string
    } & PagingQuery,
    token?: string,
  ) =>
  () =>
    axios
      .get<Paginate<User>>(API + '/api/user', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)

export const addUser = async (data: {
  name: string
  email: string
  roleId: string
}) => {
  return axios.post(API + '/api/user', data).then((res) => res.data)
}
