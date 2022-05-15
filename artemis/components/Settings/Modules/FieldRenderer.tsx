import { ComponentProps, useCallback, useEffect, useRef, useState } from 'react'

import { useCommand } from '@utils/hooks/useCommand'
import { useModal } from '@utils/hooks/useModal'
import { FieldMeta, Module } from '@utils/models/module'

import Group from './Group'
import GroupModal from './GroupModal'

type Props = {
  module: Module | undefined
} & Pick<ComponentProps<typeof Group>, 'onEditField' | 'onRemoveField'>

const parseMeta = (meta: NonNullable<Module['meta']>) =>
  meta?.reduce(
    (sum, curr) => ({
      ...sum,
      [curr.group]: (sum[curr.group] || []).concat(curr),
    }),
    {} as Record<string, FieldMeta[]>,
  )

export default function FieldRenderer({
  module,
  onEditField: editField,
  onRemoveField: removeField,
}: Props) {
  const { meta } = module || {}
  const [data, setData] = useState(parseMeta(meta || []))

  const tempGroups = useRef<string[]>([])

  useEffect(() => {
    const newData = parseMeta(meta || [])
    tempGroups.current.forEach((groupName) => {
      newData[groupName] = []
    })

    setData(newData)
    tempGroups.current = []
  }, [meta])

  const groupNameRef = useRef<string>()

  const [groupModal, open, close] = useModal()
  useCommand('cmd:open-group-modal', () => {
    groupNameRef.current = undefined
    open()
  })

  useCommand<string>('cmd:create-group', (receive) => {
    if (!receive) return

    const { payload: groupName } = receive
    if (data[groupName]) return

    tempGroups.current = [...tempGroups.current, groupName]
    setData((data) => ({ ...data, [groupName]: [] }))
  })

  const editGroup = useCallback<ComponentProps<typeof Group>['onEditGroup']>(
    (name) => {
      groupNameRef.current = name
      open()
    },
    [],
  )

  return (
    <div className="flex flex-col gap-5">
      {Object.keys(data).map((groupName, index) => (
        <Group
          key={groupName}
          name={groupName || undefined}
          data={data[groupName]}
          includeName={!index}
          onEditField={editField}
          onRemoveField={removeField}
          onEditGroup={editGroup}
        />
      ))}

      <GroupModal
        close={close}
        visible={groupModal}
        name={groupNameRef.current}
      />
    </div>
  )
}
