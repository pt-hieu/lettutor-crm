import axios, { AxiosRequestConfig } from 'axios'
import { POSEIDON_API } from 'environment'

export const createBug =
  (config: AxiosRequestConfig) => (data: any) =>
    axios
      .post(POSEIDON_API + '/api/bugs', { data }, config)
      .then((res) => res.data)
