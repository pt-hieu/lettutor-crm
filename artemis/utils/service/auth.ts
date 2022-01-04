import axios, { AxiosRequestConfig } from 'axios'
import {
  POSEIDON_API,
  POSEIDON_IDENTIFIER,
  POSEIDON_PASSWORD,
} from 'environment'

export const logInToPoseidon = (config: AxiosRequestConfig) => () =>
  axios
    .post(
      POSEIDON_API + '/api/auth/local',
      {
        identifier: POSEIDON_IDENTIFIER,
        password: POSEIDON_PASSWORD,
      },
      config,
    )
    .then((res) => res.data)
