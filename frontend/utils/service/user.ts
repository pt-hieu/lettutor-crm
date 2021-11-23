import axios from 'axios'
import { API } from 'environment'

export const requestResetEmail = (data: { email: string }) =>
  axios.post(API + '/api/user/reset-password', data)

export const updatePassword = (data: { token: string; password: string }) =>
  axios.put(API + '/api/user/password', data)

export const changePassword = (data: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}) => {
  return axios.patch(API + '/api/user/change-password', { data })
}
