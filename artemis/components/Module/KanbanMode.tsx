import { notification } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { omit, pick } from 'lodash'
import Link from 'next/link'
import { useCallback, useMemo } from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from 'react-beautiful-dnd'
import { QueryKey, useMutation, useQuery, useQueryClient } from 'react-query'

import { useModal } from '@utils/hooks/useModal'
import { useRelationField } from '@utils/hooks/useRelationField'
import { useStore } from '@utils/hooks/useStore'
import {
  AggregateType,
  Entity,
  FieldMeta,
  FieldType,
  Module,
  RelateType,
} from '@utils/models/module'
import { Paginate } from '@utils/models/paging'
import { updateEntity } from '@utils/service/module'

import { toCapitalizedWords } from './OverviewView'
import RelationCell from './RelationCell'

type Props = {
  module: Module
  entities: Entity[]
  dataKey: QueryKey
}

export default function KanbanMode({ entities, module, dataKey }: Props) {
  const { kanban_meta, meta } = module
  const { field: kanbanField } = kanban_meta || {}

  const field = meta?.find((field) => field.name === kanbanField)
  if (!field || field.relateType === RelateType.MULTIPLE) {
    return <></>
  }

  useRelationField([field])
  const { data: relationItems } = useStore<{ id: string; name: string }[]>([
    'relation-data',
    field.relateTo,
  ])

  const groupedEntities = useMemo(
    () =>
      entities.reduce(
        (res, entity) => ({
          ...res,
          [entity.data[field.name] as any]: [
            ...(res[entity.data[field.name] as string] || []),
            entity,
          ],
        }),
        // @ts-ignore
        (relationItems || field.options || []).reduce(
          // @ts-ignore
          (res, item) => ({ ...res, [item.id || item]: [] }),
          {},
        ) as Record<string, Entity[]>,
      ),
    [entities, relationItems],
  )

  const client = useQueryClient()
  const { isLoading, mutateAsync } = useMutation(
    ['updated-entity', module.name],
    (data: any) => updateEntity(module.name, data.id)(omit(data, ['id'])),
    {
      onSuccess: (res) => {
        notification.success({
          message: 'Update successfully.',
        })
      },
      onError: () => {
        client.refetchQueries(dataKey)
      },
    },
  )

  const handleDragEnd: OnDragEndResponder = useCallback(
    ({ draggableId, source, destination }) => {
      if (isLoading) return

      if (!destination) return
      if (destination.droppableId === source.droppableId) return

      const entityMap = new Map(entities.map((e) => [e.id, e]))
      if (!entityMap.has(draggableId)) return

      entityMap.get(draggableId)!.data[module.kanban_meta!.field] =
        destination.droppableId

      client.setQueryData<Paginate<Entity> | undefined>(dataKey, (e) => {
        if (!e) return e
        e.items = [...entityMap.values()]

        return { ...e }
      })

      const dto = pick(entityMap.get(draggableId)!, ['data', 'name', 'id'])
      mutateAsync({ ...dto, ...dto.data })
    },
    [module, dataKey, entities, isLoading],
  )

  return (
    <div className="flex gap-4 overflow-x-auto h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.keys(groupedEntities).map((key) => (
          <KanbanColumn
            key={key}
            value={key}
            entities={groupedEntities[key]}
            field={field}
            module={module}
          />
        ))}
      </DragDropContext>
    </div>
  )
}

type KanbanColumnProps = {
  entities: Entity[]
  value: string
  field: FieldMeta
  module: Module
}

const sum = (entities: Entity[], field: string) =>
  entities.reduce((sum, e) => sum + (Number(e.data[field]) || 0), 0)

const avg = (entities: Entity[], field: string) =>
  sum(entities, field) / entities.length

const max = (entities: Entity[], field: string) =>
  Math.max(...entities.map((e) => Number(e.data[field])))

const min = (entities: Entity[], field: string) =>
  Math.min(...entities.map((e) => Number(e.data[field])))

const aggrMap: Record<
  AggregateType,
  (entities: Entity[], field: string) => number
> = {
  [AggregateType.SUM]: sum,
  [AggregateType.AVG]: avg,
  [AggregateType.MAX]: max,
  [AggregateType.MIN]: min,
}

function KanbanColumn({ entities, value, field, module }: KanbanColumnProps) {
  const { kanban_meta: meta } = module
  const aggregation = useMemo(
    () =>
      aggrMap[module.kanban_meta?.aggregate_type || AggregateType.SUM](
        entities,
        module.kanban_meta?.aggregate_field!,
      ),
    [entities],
  )

  return (
    <Droppable droppableId={value}>
      {({ droppableProps, innerRef, placeholder }) => (
        <div className="border rounded-md min-w-[250px]">
          <div className="p-4 border-b">
            <div className="font-semibold">
              {field.relateTo && (
                <div>
                  <RelationCell relateTo={field.relateTo} targetId={value} />
                </div>
              )}

              {!field.relateTo && <div>{value}</div>}
            </div>

            {meta?.aggregate_type && (
              <div className="text-sm">
                <div>
                  {meta.aggregate_type} on{' '}
                  <span>{toCapitalizedWords(meta.aggregate_field || '')}</span>:{' '}
                  {aggregation}
                </div>
              </div>
            )}
          </div>

          <div
            {...droppableProps}
            ref={innerRef}
            className="flex flex-col overflow-y-auto h-full"
          >
            {entities.map((e, index) => (
              <KanbanEntity
                module={module}
                key={e.id}
                entity={e}
                index={index}
              />
            ))}

            {placeholder}
          </div>
        </div>
      )}
    </Droppable>
  )
}

type KanbanEntityProps = {
  entity: Entity
  index: number
  module: Module
}

function KanbanEntity({ entity, index, module }: KanbanEntityProps) {
  const [expand, _, __, toggle] = useModal()

  return (
    <Draggable draggableId={entity.id} index={index}>
      {({ draggableProps, innerRef, dragHandleProps }, { isDragging }) => (
        <div
          ref={innerRef}
          {...draggableProps}
          {...dragHandleProps}
          className={`p-4 bg-white ${
            isDragging ? 'border rounded-md' : 'border-b'
          }`}
        >
          <div className="grid grid-cols-[1fr,32px] gap-2 items-center">
            <Link
              href={{
                pathname: '[...path]',
                query: { path: [module.name, entity.id] },
              }}
            >
              <a className="w-full truncate">{entity.name}</a>
            </Link>

            <button
              onClick={toggle}
              className="w-8 aspect-square rounded-full hover:bg-gray-300"
            >
              {expand ? (
                <span className="fa fa-caret-up" />
              ) : (
                <span className="fa fa-caret-down" />
              )}
            </button>
          </div>

          <AnimatePresence exitBeforeEnter presenceAffectsLayout>
            {expand && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                transition={{ duration: 0.15, ease: 'linear' }}
                className="overflow-hidden"
              >
                {module.meta
                  ?.filter(
                    (field) =>
                      ![
                        FieldType.CHECK_BOX,
                        FieldType.MULTILINE_TEXT,
                        FieldType.RELATION,
                      ].some((type) => type === field.type),
                  )
                  .filter((field) => field.name !== module.kanban_meta?.field)
                  .map((field) => (
                    <div className="" key={field.name}>
                      <span className="font-medium">
                        {toCapitalizedWords(field.name)}
                      </span>
                      : {entity.data[field.name] || '_____'}
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Draggable>
  )
}