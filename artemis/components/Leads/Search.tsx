import { notification } from 'antd'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import Animate from '@utils/components/Animate'
import ButtonAdd from '@utils/components/ButtonAdd'
import Confirm from '@utils/components/Confirm'
import Input from '@utils/components/Input'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { Actions } from '@utils/models/role'
import { batchDelete } from '@utils/service/lead'

type Props = {
  search: string | undefined
  onSearchChange: (v: string | undefined) => void
}

export default function Search({ onSearchChange: setSearch, search }: Props) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { search },
  })

  const auth = useAuthorization()
  const client = useQueryClient()

  const submit = useCallback(
    handleSubmit(({ search }) => {
      setSearch(search)
    }),
    [],
  )

  const { data: ids } = useQuery<string[]>('selected-leadIds', {
    enabled: false,
  })

  const { mutateAsync, isLoading: isDeleting } = useMutation(
    'delete-lead',
    batchDelete,
    {
      onSuccess() {
        client.setQueryData('selected-leadIds', [])
        notification.success({ message: 'Delete leads successfully' })
      },
      onError() {
        notification.error({ message: 'Delete leads unsuccessfully' })
      },
      onSettled() {
        client.refetchQueries('leads')
      },
    },
  )

  return (
    <div className="flex justify-between items-center p-1">
      <form onSubmit={submit} className="flex">
        <Input
          showError={false}
          props={{
            type: 'text',
            placeholder: 'Search by name or email',
            ...register('search'),
          }}
        />

        <button className="crm-button ml-4 px-4">
          <span className="fa fa-search" />
        </button>

        <Animate
          shouldAnimateOnExit
          transition={{ duration: 0.2 }}
          on={search}
          animation={{
            start: { opacity: 0 },
            animate: { opacity: 1 },
            end: { opacity: 0 },
          }}
          className="ml-2"
        >
          <button
            type="button"
            onClick={() => {
              reset({ search: '' })
              submit()
            }}
            className="crm-button-outline"
          >
            Clear
          </button>
        </Animate>
      </form>

      <div className="flex gap-2">
        {!!ids?.length && (
          <Confirm
            onYes={() => mutateAsync(ids)}
            message={`Are you sure you want to delete ${ids.length} selected leads?`}
          >
            <button disabled={isDeleting} className="crm-button-danger">
              <span className="fa fa-trash mr-2" /> Delete
            </button>
          </Confirm>
        )}

        {auth[Actions.Lead.CREATE_NEW_LEAD] && (
          <ButtonAdd title="Create Lead" asLink link="/leads/add-lead" />
        )}
      </div>
    </div>
  )
}
