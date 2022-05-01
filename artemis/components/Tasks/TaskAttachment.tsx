import { uniqueId } from 'lodash'
import { useRouter } from 'next/router'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useQuery } from 'react-query'
import { useFirstMountState } from 'react-use'

import { toCapitalizedWords } from '@components/Module/OverviewView'

import SuggestInput from '@utils/components/SuggestInput'
import { Module } from '@utils/models/module'
import { getEntityForTaskCreate } from '@utils/service/module'
import { getRelation } from '@utils/service/task'

type Props = {
  entityIds: string[]
  setEntityIds: Dispatch<SetStateAction<string[]>>
}

export default function TaskAttachments({ entityIds, setEntityIds }: Props) {
  const { data: entities } = useQuery(
    'raw-entity-task-create',
    getEntityForTaskCreate(),
    { enabled: false },
  )

  const modules = useMemo(
    () => [...new Map(entities?.map((e) => [e.module.id, e.module])).values()],
    [entities],
  )

  const selectItem = useCallback((id: string) => {
    setEntityIds((ids) => [...new Set([...ids, id])])
  }, [])

  const [keys, setKeys] = useState(() =>
    entityIds.map(() => uniqueId()).concat(uniqueId()),
  )

  const isFirstMount = useFirstMountState()
  useEffect(() => {
    if (isFirstMount) return
    setKeys((keys) => [...keys.slice(0, entityIds.length), uniqueId()])
  }, [entityIds])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-semibold text-lg text-gray-700">Task Relations</h1>

      <div className="grid grid-cols-2 gap-4">
        {keys.map((value, index) => (
          <AttachmentInput
            key={value}
            value={entityIds[index] || ''}
            selectedIds={entityIds}
            modules={modules}
            onItemSelect={selectItem}
            onItemRemove={(id) =>
              setEntityIds((ids) =>
                ids.filter((selectedId) => selectedId !== id),
              )
            }
          />
        ))}
      </div>
    </div>
  )
}

type AttachmentInputProps = {
  modules: Pick<Module, 'id' | 'name'>[]
  selectedIds: string[]
  value: string
  onItemSelect: (id: string) => void
  onItemRemove?: (id: string) => void
}

function AttachmentInput({
  modules,
  selectedIds,
  value,
  onItemSelect: selectItem,
  onItemRemove: removeItem,
}: AttachmentInputProps) {
  const { query } = useRouter()
  const id = query.id as string

  const { data: relations } = useQuery(
    ['task', id, 'relations'],
    getRelation(id),
    { enabled: false },
  )
  const [selectedModuleId, setSelectedModuleId] = useState<string>()

  useEffect(() => {
    if (!relations) return
    if (!value) {
      setSelectedModuleId(undefined)
      return
    }

    setSelectedModuleId(relations.find((item) => item.id === value)?.module.id)
  }, [relations, value])

  const { data: entities } = useQuery(
    'raw-entity-task-create',
    getEntityForTaskCreate(),
    { enabled: false },
  )

  const filteredEntities = useMemo(
    () =>
      entities?.filter(
        (e) => e.module.id === selectedModuleId && !selectedIds.includes(e.id),
      ) || [],
    [selectedModuleId, selectedIds, entities],
  )

  return (
    <div className="grid grid-cols-[1fr,2fr] mb-6 gap-6">
      <div className="flex gap-2 items-center group">
        {id && (
          <button
            type="button"
            onClick={() => removeItem?.(value)}
            className="fa fa-times w-8 aspect-square rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-300"
          />
        )}

        <SuggestInput
          showError={false}
          wrapperClassname="!w-full"
          inputProps={{
            className: 'w-full text-right',
            value: selectedModuleId,
          }}
          getData={modules || []}
          getKey={(module) => module.id}
          mapValue={() =>
            toCapitalizedWords(
              modules.find((u) => u.id === selectedModuleId)?.name || '',
            )
          }
          onItemSelect={({ id }) => setSelectedModuleId(id)}
          render={(module) => <span>{toCapitalizedWords(module.name)}</span>}
          filter={(module, query) =>
            module.name.toLocaleLowerCase().includes(query)
          }
        />
      </div>

      <SuggestInput
        showError={false}
        wrapperClassname="!w-full"
        inputProps={{
          className: 'w-full',
          value,
        }}
        getData={filteredEntities}
        getKey={(e) => e.id}
        mapValue={() =>
          toCapitalizedWords(entities?.find((e) => e.id === value)?.name || '')
        }
        onItemSelect={({ id }) => selectItem(id)}
        render={(e) => <span>{toCapitalizedWords(e.name)}</span>}
        filter={(e, query) => e.name.toLocaleLowerCase().includes(query)}
      />
    </div>
  )
}
