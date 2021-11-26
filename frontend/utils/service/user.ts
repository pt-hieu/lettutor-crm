import { User } from '@utils/models/user'
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

export const getUsers =
  (
    token?: string,
    params: { query?: string; page: number; limit: number; role?: string } = {
      limit: 10,
      page: 1,
    },
  ) =>
    () =>
      // axios.get(API + '/api/user', {
      //   headers: { authorization: "Bearer " + token },
      //   params
      // }).then((res) => res.data)
      Promise.resolve([
        {
          name: 'admin',
          email: 'admin@mail.com',
          role: "super admin",
        },
      ] as unknown as User[])
