import { notification } from 'antd'
import { capitalize } from 'lodash'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import ButtonAdd from '@utils/components/ButtonAdd'
import Confirm from '@utils/components/Confirm'
import Input from '@utils/components/Input'
import { Module } from '@utils/models/module'
import { batchDeleteEntities } from '@utils/service/module'

type Props = {
  module: Module
  onSearchChange?: (v: string) => void
  search?: string
}

export default function ModuleHeader({
  module,
  onSearchChange,
  search,
}: Props) {
  const client = useQueryClient()
  const { data: ids } = useQuery<string[]>(['selected-ids', module.name], {
    enabled: false,
  })

  const { register, handleSubmit, setValue } = useForm<{ search?: string }>({
    defaultValues: { search },
  })

  useEffect(() => {
    setValue('search', search)
  }, [search])

  const submitSearch = useCallback(
    handleSubmit(({ search }) => {
      if (!onSearchChange) return
      onSearchChange(search!)
    }),
    [],
  )

  const { mutateAsync, isLoading } = useMutation(
    ['deleted-entities', module.name],
    batchDeleteEntities,
    {
      onSuccess() {
        client.setQueryData(['selected-ids', module.name], [])
        notification.success({ message: 'Delete account succesfully' })
      },
      onError() {
        notification.error({ message: 'Delete account unsuccesfully' })
      },
      onSettled() {
        client.refetchQueries(module.name)
      },
    },
  )

  return (
    <div className="flex justify-between items-center p-1">
      <form onSubmit={submitSearch} className="flex">
        <Input
          showError={false}
          props={{
            type: 'text',
            placeholder: 'Search',
            ...register('search'),
          }}
        />

        <button className="crm-button ml-4 px-4">
          <span className="fa fa-search" />
        </button>
      </form>

      <div className="flex gap-2">
        {!!ids?.length && (
          <Confirm
            onYes={() => mutateAsync(ids)}
            message={`Are you sure you want to delete ${ids.length} selected leads?`}
          >
            <button disabled={isLoading} className="crm-button-danger">
              <span className="fa fa-trash mr-2" /> Delete
            </button>
          </Confirm>
        )}

        <ButtonAdd
          title={`Create ${capitalize(module.name)}`}
          asLink
          link={`/${module.name}/create`}
        />
      </div>
    </div>
  )
}
