import { BugSubmitPayload } from '@utils/components/BugReporter'
import axios from 'axios'
import { POSEIDON_API } from 'environment'

export const createBug = (token: string) => (data: BugSubmitPayload) =>
  axios
    .post(
      POSEIDON_API + '/api/bugs',
      { data },
      {
        withCredentials: false,
        headers: {
          authorization: 'Bearer ' + token,
        },
      },
    )
    .then((res) => res.data)
