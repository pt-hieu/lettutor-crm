import { GlobalState } from '@utils/GlobalStateKey'
import { strapiApiCall } from '@utils/libs/strapiApiCall'
import { logInToPoseidon } from '@utils/service/auth'
import { useEffect } from 'react'
import { useMutation, useQueryClient } from 'react-query'

export default function PoseidonAuth() {
  const client = useQueryClient()

  const { mutateAsync } = useMutation(
    'log-in-to-poseidon',
    strapiApiCall<{ jwt: string }, any>()(logInToPoseidon),
    {
      onSuccess(res) {
        client.setQueryData(GlobalState.POSEIDON_TOKEN, res.jwt)
      },
    },
  )

  useEffect(() => {
    const token = client.getQueryData(GlobalState.POSEIDON_TOKEN)
    if (token) return

    mutateAsync(undefined)
  }, [])

  return <></>
}
