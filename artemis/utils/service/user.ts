import { Paginate, PagingQuery } from '@utils/models/paging'
import { User, UserStatus } from '@utils/models/user'
import axios from 'axios'
import { API } from 'environment'

export const requestResetEmail = (data: { email: string }) =>
  axios.post(API + '/apollo/user/reset-password', data)

export const updatePassword = (data: { token: string; password: string }) =>
  axios.put(API + '/apollo/user/password', data)

export const changePassword = async (data: {
  oldPassword: string
  newPassword: string
}) =>
  axios
    .patch(API + '/apollo/user/change-password', data)
    .then((res) => res.data)

export const getSelf = (token?: string) => () =>
  axios
    .get<Pick<User, 'name' | 'email' | 'status' | 'roles' | 'id'>>(
      API + '/apollo/user/self',
      {
        headers: { authorization: 'Bearer ' + token },
      },
    )
    .then((res) => res.data)

export const updateUserInformation = (data: { name: string }) =>
  axios.patch<User>(API + '/apollo/user', data).then((res) => res.data)

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
      .get<Paginate<User>>(API + '/apollo/user', {
        headers: { authorization: 'Bearer ' + token },
        params,
      })
      .then((res) => res.data)

export const getRawUsers = (token?: string) => () =>
  axios
    .get<Pick<User, 'id' | 'name'>[]>(API + '/apollo/user/raw', {
      headers: {
        authorization: 'Bearer ' + token,
      },
    })
    .then((res) => res.data)

export const addUser = async (data: {
  name: string
  email: string
  roleId: string
}) => {
  return axios.post(API + '/apollo/user', data).then((res) => res.data)
}

export const updateStatus = async (data: {
  userId: string
  status: UserStatus.ACTIVE | UserStatus.INACTIVE
}) => {
  const { userId, status } = data
  return axios
    .patch(API + `/apollo/user/${userId}/activate`, { status })
    .then((res) => res.data)
}

export const invalidateAddUserToken = async (data: { userId: string }) => {
  const { userId } = data
  return axios
    .get(API + `/apollo/user/${userId}/invalidate`)
    .then((res) => res.data)
}
