import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import { useQuery } from 'react-query'

import { toCapitalizedWords } from '@components/Module/OverviewView'

import SuggestInput from '@utils/components/SuggestInput'
import { Module } from '@utils/models/module'
import { getEntityForTaskCreate } from '@utils/service/module'

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
    () => [...new Map(entities!.map((e) => [e.module.id, e.module])).values()],
    [],
  )

  const selectItem = useCallback((id: string) => {
    setEntityIds((ids) => [...ids, id])
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-semibold text-lg text-gray-700">Task Attachment</h1>

      <div className="grid grid-cols-2 gap-4">
        {entityIds.concat('').map((value, index) => (
          <AttachmentInput
            key={index}
            value={value}
            selectedIds={entityIds}
            modules={modules}
            onItemSelect={selectItem}
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
}

function AttachmentInput({
  modules,
  selectedIds,
  value,
  onItemSelect: selectItem,
}: AttachmentInputProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>()

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
    [selectedModuleId, selectedIds],
  )

  return (
    <div className="grid grid-cols-[1fr,2fr] mb-6 gap-6">
      <SuggestInput
        showError={false}
        wrapperClassname="!w-full"
        inputProps={{
          className: 'w-full text-right',
          value: selectedModuleId,
        }}
        getData={modules || []}
        getKey={(module) => module.id}
        mapValue={(id, modules) =>
          toCapitalizedWords(modules?.find((u) => u.id === id)?.name || '')
        }
        onItemSelect={({ id }) => setSelectedModuleId(id)}
        render={(module) => <span>{toCapitalizedWords(module.name)}</span>}
        filter={(module, query) =>
          module.name.toLocaleLowerCase().includes(query)
        }
      />

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
