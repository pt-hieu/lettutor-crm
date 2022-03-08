import { Switch, notification } from 'antd'
import { ViewMode } from 'pages/deals'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import Animate from '@utils/components/Animate'
import ButtonAdd from '@utils/components/ButtonAdd'
import Confirm from '@utils/components/Confirm'
import Input from '@utils/components/Input'
import Tooltip from '@utils/components/Tooltip'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useQueryState } from '@utils/hooks/useQueryState'
import { Actions } from '@utils/models/role'
import { batchDelete } from '@utils/service/deal'

type Props = {
  search: string | undefined
  onSearchChange: (v: string | undefined) => void
}

export default function DealsSearch({
  onSearchChange: setSearch,
  search,
}: Props) {
  const client = useQueryClient()

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { search },
  })

  const auth = useAuthorization()

  const [kanbanMode, setKanbanMode] = useQueryState<ViewMode>(
    'view-mode',
    ViewMode.TABULAR,
  )

  useEffect(() => {
    if (kanbanMode === ViewMode.TABULAR) return
    client.setQueryData('selected-dealIds', [])
  }, [kanbanMode])

  const submit = useCallback(
    handleSubmit(({ search }) => {
      setSearch(search)
    }),
    [],
  )

  const { data: ids } = useQuery<string[]>('selected-dealIds', {
    enabled: false,
  })

  const { mutateAsync, isLoading } = useMutation('delete-deals', batchDelete, {
    onSuccess() {
      client.setQueryData('selected-dealIds', [])
      notification.success({ message: 'Delete deals successfully' })
    },
    onError() {
      notification.error({ message: 'Delete deals unsuccessfully' })
    },
    onSettled() {
      client.invalidateQueries('deals')
    },
  })

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

      <div className="flex gap-8 items-center">
        <Tooltip title="Toggle Kanban mode">
          <div className="flex gap-2 items-center">
            <Switch
              checked={kanbanMode === ViewMode.KANBAN ? true : false}
              onChange={(v) =>
                setKanbanMode(v ? ViewMode.KANBAN : ViewMode.TABULAR)
              }
            />
            <span
              className={`fa fa-columns crm-transition text-[18px] ${
                kanbanMode === ViewMode.KANBAN
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`}
            />
          </div>
        </Tooltip>

        <div className="flex gap-2">
          {!!ids?.length && kanbanMode !== ViewMode.KANBAN && (
            <Confirm
              onYes={() => mutateAsync(ids)}
              message={`Are you sure you want to delete ${ids.length} selected deals?`}
            >
              <button disabled={isLoading} className="crm-button-danger">
                <span className="fa fa-trash mr-2" />
                Delete
              </button>
            </Confirm>
          )}

          {auth[Actions.Deal.CREATE_NEW_DEAL] && (
            <ButtonAdd title="Create Deal" asLink link="/deals/add-deal" />
          )}
        </div>
      </div>
    </div>
  )
}
