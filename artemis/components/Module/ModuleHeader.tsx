import { notification } from 'antd'
import { capitalize } from 'lodash'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import Animate from '@utils/components/Animate'
import ButtonAdd from '@utils/components/ButtonAdd'
import Confirm from '@utils/components/Confirm'
import Input from '@utils/components/Input'
import { Module } from '@utils/models/module'
import { batchDeleteEntities } from '@utils/service/module'

type Props = {
  module: Module
}

export default function ModuleHeader({ module }: Props) {
  const client = useQueryClient()
  const { data: ids } = useQuery<string[]>(['selected-ids', module.name], {
    enabled: false,
  })

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
      <form className="flex">
        <Input
          showError={false}
          props={{
            type: 'text',
            placeholder: 'Search',
          }}
        />

        <button className="crm-button ml-4 px-4">
          <span className="fa fa-search" />
        </button>

        <Animate
          shouldAnimateOnExit
          transition={{ duration: 0.2 }}
          // on={search}
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
              // reset({ search: '' })
              // submit()
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
