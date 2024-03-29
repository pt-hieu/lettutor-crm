import { notification } from 'antd'
import { useRouter } from 'next/router'
import { ComponentProps, useCallback, useMemo, useRef, useState } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useAsync } from 'react-use'

import FieldModal from '@components/Settings/Modules/FieldModal'
import FieldRenderer from '@components/Settings/Modules/FieldRenderer'
import FieldSelector from '@components/Settings/Modules/FieldSelector'

import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'
import { useCommand } from '@utils/hooks/useCommand'
import { useModal } from '@utils/hooks/useModal'
import { useRelationField } from '@utils/hooks/useRelationField'
import useUnsavedChanges from '@utils/hooks/useUnsavedChanges'
import {
  ConvertMeta,
  FieldMeta,
  FieldType,
  KanbanMeta,
  Module,
} from '@utils/models/module'
import { updateModule } from '@utils/service/module'

export default function ModuleView() {
  const { query, push } = useRouter()
  const moduleName = query.moduleName as string

  const [localModule, setLocalModule] = useState<Module>()

  const { data: modules } = useQuery<Module[]>('modules', {
    enabled: false,
  })

  useRelationField(localModule?.meta || null)

  useAsync(async () => {
    if (!modules) return
    setLocalModule(modules.find((m) => m.name === moduleName))
  }, [modules])

  const [setDirty, setPristine] = useUnsavedChanges()

  const [fieldModal, open, close] = useModal()

  const selectedFieldRef = useRef<FieldMeta>()
  const selectedFieldType = useRef<FieldType>()
  const selectedGroup = useRef<string>()

  const handleDrop = useCallback<
    ComponentProps<typeof DragDropContext>['onDragEnd']
  >(({ draggableId, source, destination }) => {
    if (
      destination &&
      destination.droppableId !== 'selector' &&
      source.droppableId === 'selector'
    ) {
      selectedFieldRef.current = undefined
      selectedFieldType.current = draggableId as FieldType
      selectedGroup.current = destination.droppableId

      open()
    }

    if (destination && destination.droppableId === source.droppableId) {
      console.log({ source, destination })
    }

    if (
      destination &&
      destination.droppableId !== 'selector' &&
      source.droppableId !== 'selector'
    ) {
      setLocalModule((module) => {
        if (!module || !module.meta) return module

        const targetIndex = module.meta.findIndex(
          ({ name, group }) =>
            name === draggableId && group === source.droppableId,
        )

        const newIndex = module.meta.findIndex(
          ({ group }) => group === destination.droppableId,
        )
        if (targetIndex === -1 || newIndex === -1) return module

        const [target] = module.meta.splice(targetIndex, 1)
        module.meta.splice(newIndex, 0, target)

        target.group = destination.droppableId

        return {
          ...module!,
          meta: module?.meta.map((field) => ({ ...field })) || [],
        }
      })
    }

    setDirty()
  }, [])

  const handleBack = () => {
    push('/settings/modules')
  }

  const client = useQueryClient()
  const { isLoading, mutateAsync } = useMutation(
    'update-module',
    updateModule(localModule?.id || ''),
    {
      onSuccess() {
        client.refetchQueries('modules')
        notification.success({ message: 'Update module successfully' })
        handleBack()
      },
      onError() {
        notification.error({ message: 'Update module unsuccesfully' })
      },
    },
  )

  useCommand<{ meta: ConvertMeta[] }>(
    'cmd:update-convert-setting',
    (received) => {
      if (!received) return
      const {
        payload: { meta },
      } = received

      setLocalModule((module) => {
        const localModule = {
          ...module!,
          convert_meta: meta,
        }

        mutateAsync(localModule)
        return localModule
      })
      setDirty()
    },
  )

  useCommand<KanbanMeta>('cmd:update-kanban-setting', (received) => {
    if (!received) return
    const { payload } = received

    setLocalModule((module) => {
      const localModule: Module = {
        ...module!,
        kanban_meta: payload,
      }

      mutateAsync(localModule)
      return localModule
    })
    setDirty()
  })

  useCommand<{ name: string; newName: string }>(
    'cmd:update-group',
    (receive) => {
      if (!receive) return
      const {
        payload: { name, newName },
      } = receive

      setLocalModule((module) => {
        module?.meta?.forEach((field) => {
          if (field.group !== name) return
          field.group = newName
        })

        return {
          ...module!,
          meta: module?.meta?.map((field) => ({ ...field })) || [],
        }
      })
      setDirty()
    },
  )

  useCommand<{ name: string }>('cmd:delete-group', (received) => {
    if (!received) return
    const {
      payload: { name },
    } = received

    setLocalModule((module) => {
      return {
        ...module!,
        meta:
          module?.meta
            ?.filter((field) => field.group !== name)
            .map((field) => ({ ...field })) || [],
      }
    })
    setDirty()
  })

  useCommand<{ name: string; type: 'up' | 'down' }>(
    'cmd:change-group-order',
    (receive) => {
      if (!receive) return
      const {
        payload: { name, type },
      } = receive

      const currentOrder = [
        ...new Map(
          localModule?.meta?.map((field) => [field.group, field]),
        ).values(),
      ]

      const currentIndex = currentOrder.findIndex(
        (field) => field.group === name,
      )
      if (currentIndex === -1) return

      const [field] = currentOrder.splice(currentIndex, 1)
      if (type === 'up') {
        currentOrder.splice(currentIndex - 1, 0, field)
      }

      if (type === 'down') {
        currentOrder.splice(currentIndex + 1, 0, field)
      }

      const othersField =
        localModule?.meta?.filter(
          (field) => !currentOrder.some(({ name }) => name === field.name),
        ) || []
      setLocalModule((module) => ({
        ...module!,
        meta: currentOrder.concat(...othersField),
      }))
      setDirty()
    },
  )

  const handleFieldSubmit = useCallback<
    ComponentProps<typeof FieldModal>['onSubmit']
  >((data) => {
    close()

    data.type = selectedFieldType.current!
    selectedFieldRef.current = undefined

    setLocalModule((module) => ({
      ...module!,
      meta: [
        ...new Map(
          [...(module?.meta || []), data].map((field) => [field.name, field]),
        ).values(),
      ],
    }))

    setDirty()
  }, [])

  const editField = useCallback<
    ComponentProps<typeof FieldRenderer>['onEditField']
  >(
    (name) => {
      const selectedField = localModule?.meta?.find(
        (field) => field.name === name,
      )
      if (!selectedField) return

      selectedFieldRef.current = selectedField
      selectedFieldType.current = selectedField.type
      selectedGroup.current = undefined

      open()
    },
    [localModule],
  )

  const removeField = useCallback<
    ComponentProps<typeof FieldRenderer>['onRemoveField']
  >((name) => {
    setLocalModule((module) => ({
      ...module!,
      meta: module?.meta?.filter((field) => field.name !== name) || [],
    }))
  }, [])

  const shouldEnableConfirmStage = useMemo(
    () =>
      localModule?.meta?.some((field) => field.relateTo === 'dealstage') ||
      false,
    [localModule],
  )

  return (
    <Layout>
      <FieldModal
        enableConfirmStage={shouldEnableConfirmStage}
        visible={fieldModal}
        close={close}
        type={selectedFieldType.current}
        data={selectedFieldRef.current}
        group={selectedGroup.current}
        onSubmit={handleFieldSubmit}
      />

      <div className="min-h-[60px] sticky top-[60px] border-b z-[908] bg-white crm-container flex justify-between items-center">
        <div className="capitalize font-medium text-xl">
          Module {localModule?.name}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleBack} className="crm-button-outline">
            <span className="fa fa-times mr-2" />
            Cancel
          </button>

          <button
            disabled={isLoading}
            onClick={() => {
              setPristine()
              mutateAsync(localModule || {})
            }}
            className="crm-button"
          >
            <Loading on={isLoading}>
              <span className="fa fa-check mr-2" />
              Save
            </Loading>
          </button>
        </div>
      </div>

      <div className="crm-container grid grid-cols-[300px,1fr] gap-8 mb-4">
        <DragDropContext onDragEnd={handleDrop}>
          <FieldSelector module={localModule} />

          <div>
            <FieldRenderer
              module={localModule}
              onEditField={editField}
              onRemoveField={removeField}
            />
          </div>
        </DragDropContext>
      </div>
    </Layout>
  )
}
