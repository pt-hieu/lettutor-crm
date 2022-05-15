import { useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'

import Input from '@utils/components/Input'
import { useQueryState } from '@utils/hooks/useQueryState'
import { LogAction, LogSource } from '@utils/models/log'
import { Module } from '@utils/models/module'
import { getRawUsers } from '@utils/service/user'

type FormData = {
  source: LogSource | ''
  action: LogAction | ''
  owner: string
  from: string
  to: string
}

type Props = {
  onSourceChange?: (s: LogSource) => void
  onActionChange?: (a: LogAction) => void
  onOwnerChange?: (o: string) => void
  onFromChange?: (f: string) => void
  onToChange?: (t: string) => void

  defaultValues: Partial<FormData>
  containerClassName?: string
  stopPropagateOnClick?: boolean
}

export default function LogFilter({
  defaultValues,
  containerClassName,
  stopPropagateOnClick,
  onActionChange: changeAction,
  onFromChange: changeFrom,
  onOwnerChange: changeOwner,
  onSourceChange: changeSource,
  onToChange: changeTo,
}: Props) {
  const { register, watch, handleSubmit } = useForm<FormData>({
    defaultValues,
  })

  const { data: users, refetch } = useQuery('user-raw', getRawUsers(), {
    enabled: false,
  })

  useEffect(() => {
    const subs = watch(() =>
      handleSubmit((data) => {
        const maps: Record<keyof FormData, ((v: any) => void) | undefined> = {
          action: changeAction,
          from: changeFrom,
          owner: changeOwner,
          source: changeSource,
          to: changeTo,
        }

        unstable_batchedUpdates(() => {
          Object.entries(data).forEach(([key, value]: [unknown, unknown]) => {
            if (value === defaultValues[key as keyof FormData]) return
            if (!maps[key as keyof FormData]) return

            maps[key as keyof FormData]!(value || undefined)
          })
        })
      })(),
    )

    return subs.unsubscribe
  }, [watch])

  useEffect(() => {
    refetch()
  }, [])

  const { data: modules } = useQuery<Pick<Module, 'name'>[]>('modules', {
    enabled: false,
    initialData: [],
  })

  const [property, setProperty] = useQueryState('property')
  const [entity, setEntity] = useQueryState('entity')

  return (
    <div
      onClick={(e) => stopPropagateOnClick && e.stopPropagation()}
      className={containerClassName}
    >
      <form className="mb-4">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="crm-label-optional font-medium" htmlFor="source">
              Source
            </label>
            <Input
              as="select"
              showError={false}
              props={{
                ...register('source'),
                id: 'source',
                className: 'w-full',
                disabled: !changeSource,
                children: (
                  <>
                    <option value="">All</option>
                    {(modules || []).map(({ name }) => (
                      <option key={name} value={name}>
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </option>
                    ))}
                  </>
                ),
              }}
            />
          </div>

          <div>
            <label className="crm-label-optional font-medium" htmlFor="action">
              Action
            </label>
            <Input
              as="select"
              showError={false}
              props={{
                ...register('action'),
                id: 'action',
                className: 'w-full',
                disabled: !changeAction,
                children: (
                  <>
                    <option value="">All</option>
                    {Object.values(LogAction).map((action) => (
                      <option key={action} value={action}>
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </option>
                    ))}
                  </>
                ),
              }}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="crm-label-optional font-medium" htmlFor="owner">
            Owner
          </label>
          <Input
            as="select"
            showError={false}
            props={{
              ...register('owner'),
              id: 'owner',
              className: 'w-full',
              disabled: !changeOwner,
              children: (
                <>
                  <option value="">All</option>
                  {users?.map((user) => (
                    <option value={user.id} key={user.id}>
                      {user.name}
                    </option>
                  ))}
                </>
              ),
            }}
          />
        </div>

        <div className="mb-4">
          <label className="crm-label-optional font-medium" htmlFor="from">
            From
          </label>
          <Input
            showError={false}
            props={{
              ...register('from'),
              id: 'from',
              type: 'date',
              disabled: !changeFrom,
              className: 'w-full',
            }}
          />
        </div>

        <div>
          <label className="crm-label-optional font-medium" htmlFor="to">
            To
          </label>
          <Input
            showError={false}
            props={{
              ...register('to'),
              id: 'to',
              type: 'date',
              disabled: !changeTo,
              className: 'w-full',
            }}
          />
        </div>
      </form>

      <div className="flex gap-x-4 gap-y-2 flex-wrap">
        {entity && (
          <FilterItem value={entity} onCancel={() => setEntity(undefined)} />
        )}

        {property && (
          <FilterItem
            value={property}
            onCancel={() => setProperty(undefined)}
          />
        )}
      </div>
    </div>
  )
}

type FilterItemProps = {
  value: any
  onCancel: () => void
}

function FilterItem({ value, onCancel: cancel }: FilterItemProps) {
  return (
    <div className="flex gap-3 items-center px-3 py-2 border rounded-md hover:border-blue-600 hover:text-blue-600">
      <span>{value}</span>
      <button onClick={cancel} className="fa fa-times" />
    </div>
  )
}
