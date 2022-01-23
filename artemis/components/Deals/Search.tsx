import Animate from '@utils/components/Animate'
import ButtonAdd from '@utils/components/ButtonAdd'
import { menuItemClass } from '@utils/components/Header'
import Input from '@utils/components/Input'
import { useQueryState } from '@utils/hooks/useQueryState'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Switch, Tooltip } from 'antd'
import { ViewMode } from 'pages/deals'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { Actions } from '@utils/models/role'

type Props = {
  search: string | undefined
  onSearchChange: (v: string | undefined) => void
}

export default function DealsSearch({
  onSearchChange: setSearch,
  search,
}: Props) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { search },
  })

  const auth = useAuthorization()

  const [kanbanMode, setKanbanMode] = useQueryState<ViewMode>('view-mode', {
    subscribe: true,
  })

  const submit = useCallback(
    handleSubmit(({ search }) => {
      setSearch(search)
    }),
    [],
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

        <button className="crm-button ml-4">Search</button>
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

        {auth[Actions.Deal.CREATE_NEW_DEAL] && (
          <ButtonAdd
            title="Create Deal"
            asLink
            link="/deals/add-deal"
            menuItems={
              <>
                <button className={menuItemClass}>
                  <span className="fa fa-upload mr-4" />
                  Import Deals
                </button>
                <button className={menuItemClass}>
                  <span className="fa fa-book mr-4" />
                  Import Notes
                </button>
              </>
            }
          />
        )}
      </div>
    </div>
  )
}
