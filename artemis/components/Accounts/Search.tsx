import Animate from '@utils/components/Animate'
import ButtonAdd from '@utils/components/ButtonAdd'
import { menuItemClass } from '@utils/components/Header'
import Input from '@utils/components/Input'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { Actions } from '@utils/models/role'
import { batchDelete } from '@utils/service/account'
import { notification } from 'antd'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'

type Props = {
  search: string | undefined
  onSearchChange: (v: string | undefined) => void
}

export default function Search({ onSearchChange: setSearch, search }: Props) {
  const auth = useAuthorization()
  const client = useQueryClient()

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { search },
  })

  const submit = useCallback(
    handleSubmit(({ search }) => {
      setSearch(search)
    }),
    [],
  )

  const { data: ids } = useQuery<string[]>('selected-accountIds', {
    enabled: false,
  })
  const { mutateAsync, isLoading } = useMutation(
    'delete-account',
    batchDelete,
    {
      onSuccess() {
        client.setQueryData('selected-accountIds', [])
        notification.success({ message: 'Delete account succesfully' })
      },
      onError() {
        notification.error({ message: 'Delete account unsuccesfully' })
      },
      onSettled() {
        client.invalidateQueries('accounts')
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
            placeholder: 'Search by name',
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
          <button
            disabled={isLoading}
            onClick={() => mutateAsync(ids || [])}
            className="crm-button-danger"
          >
            <span className="fa fa-trash mr-2" />
            Delete
          </button>
        )}

        {auth[Actions.Account.CREATE_NEW_ACCOUNT] && (
          <ButtonAdd
            title="Create Account"
            asLink
            link="/accounts/add-account"
          />
        )}
      </div>
    </div>
  )
}
