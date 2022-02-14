import axios from 'axios'
import {
  API,
  POSEIDON_IDENTIFIER,
  POSEIDON_PASSWORD,
} from 'environment'

export const logInToPoseidon = () =>
  axios
    .post<{ jwt: string }>(API + '/poseidon/auth/local', {
      identifier: POSEIDON_IDENTIFIER,
      password: POSEIDON_PASSWORD,
    })
    .then((res) => res.data)
