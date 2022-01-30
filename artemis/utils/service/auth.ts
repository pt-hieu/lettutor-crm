import { toStrapi } from '@utils/libs/toStrapi'
import {
  POSEIDON_API,
  POSEIDON_IDENTIFIER,
  POSEIDON_PASSWORD,
} from 'environment'

export const logInToPoseidon = () =>
  toStrapi
    .post<{ jwt: string }>(POSEIDON_API + '/api/auth/local', {
      identifier: POSEIDON_IDENTIFIER,
      password: POSEIDON_PASSWORD,
    })
    .then((res) => res.data)
