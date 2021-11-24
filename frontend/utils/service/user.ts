import { asyncTryCatch } from '@utils/libs/functionalTryCatch'
import axios from 'axios'
import { API } from 'environment'

export const requestResetEmail = (data: { email: string }) =>
  axios.post(API + '/api/user/reset-password', data)

export const updatePassword = (data: { token: string; password: string }) =>
  axios.put(API + '/api/user/password', data)

export const changePassword = async (data: {
  oldPassword: string
  newPassword: string
  token: string
}) => {
  const { oldPassword, newPassword, token } = data
  const [_, error] = await asyncTryCatch(() =>
    axios.patch(
      API + '/api/user/change-password',
      { oldPassword, newPassword },
      { headers: { authorization: 'Bearer ' + token } },
    ),
  )
  return { error }
}
