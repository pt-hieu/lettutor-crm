import { toStrapi } from '@utils/libs/toStrapi'
import { POSEIDON_API } from 'environment'

export const createBug = (data: any) =>
  toStrapi.post(POSEIDON_API + '/api/bugs', { data }).then((res) => res.data)
