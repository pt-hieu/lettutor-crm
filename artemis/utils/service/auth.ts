import axios from 'axios'
import {
  POSEIDON_API,
  POSEIDON_IDENTIFIER,
  POSEIDON_PASSWORD,
} from 'environment'

export const logInToPoseidon = () =>
  axios
    .post<{ jwt: string }>(
      POSEIDON_API + '/api/auth/local',
      {
        identifier: POSEIDON_IDENTIFIER,
        password: POSEIDON_PASSWORD,
      },
      {
        withCredentials: false,
      },
    )
    .then((res) => res.data)
