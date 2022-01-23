import axios, { AxiosRequestConfig } from 'axios'
import { POSEIDON_API } from 'environment'

export const getChangeLog = (config: AxiosRequestConfig) => () =>
  axios.get(POSEIDON_API + '/api/change-logs', config).then((res) => res.data)
