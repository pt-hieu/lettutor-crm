import { Switch, notification } from 'antd'
import { capitalize } from 'lodash'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import ButtonAdd from '@utils/components/ButtonAdd'
import Confirm from '@utils/components/Confirm'
import Input from '@utils/components/Input'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { Module } from '@utils/models/module'
import { ActionType } from '@utils/models/role'
import { batchDeleteEntities } from '@utils/service/module'

import { MODE } from './OverviewView'

type Props = {
  module: Module
  onSearchChange?: (v: string) => void
  search?: string
  onModeChange: (mode: MODE) => void
  mode: MODE
}

export default function ModuleHeader({
  module,
  onSearchChange,
  search,
  onModeChange: changeMode,
  mode,
}: Props) {
  const client = useQueryClient()
  const auth = useAuthorization()
  const { data: ids } = useQuery<string[]>(['selected-ids', module.name], {
    enabled: false,
  })

  const { register, handleSubmit, setValue } = useForm<{ search?: string }>({
    defaultValues: { search },
    shouldUnregister: true,
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
        notification.success({ message: `Delete ${module.name} succesfully` })
      },
      onError() {
        notification.error({ message: `Delete ${module.name} unsuccesfully` })
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

      <div className="flex gap-2 items-center">
        {module.kanban_meta && (
          <Switch
            checked={mode === MODE.KANBAN}
            onChange={(v) => changeMode(v ? MODE.KANBAN : MODE.DEFAULT)}
          />
        )}

        {!!ids?.length && (
          <Confirm
            onYes={() => mutateAsync(ids)}
            message={`Are you sure you want to delete ${ids.length} selected ${module.name}?`}
          >
            <button disabled={isLoading} className="crm-button-danger">
              <span className="fa fa-trash mr-2" /> Delete
            </button>
          </Confirm>
        )}

        {auth(ActionType.CAN_CREATE_NEW, module.name) && (
          <ButtonAdd
            title={`Create ${capitalize(module.name)}`}
            asLink
            link={`/${module.name}/create`}
          />
        )}
      </div>
    </div>
  )
}
