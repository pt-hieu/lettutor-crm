import { notification } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { omit, pick } from 'lodash'
import Link from 'next/link'
import {
  ElementRef,
  ElementType,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from 'react-beautiful-dnd'
import { QueryKey, useMutation, useQuery, useQueryClient } from 'react-query'

import ConfirmStageModal from '@utils/components/ConfirmStageModal'
import { useModal } from '@utils/hooks/useModal'
import { useRelationField } from '@utils/hooks/useRelationField'
import { useStore } from '@utils/hooks/useStore'
import { DealStageType } from '@utils/models/deal'
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
  const { field: kanbanFieldName } = kanban_meta || {}

  useRelationField(module.meta)

  const [confirmStageWon, openWon, closeWon] = useModal()
  const [confirmStageLost, openLost, closeLost] = useModal()

  const kanbanField = meta?.find((field) => field.name === kanbanFieldName)

  const [selectedId, setSelectedId] = useState<string>('')
  const entity = useMemo(
    () => entities.find((e) => e.id === selectedId),
    [selectedId, entities],
  )

  const { data: relationItems } = useStore<{ id: string; name: string }[]>([
    'relation-data',
    kanbanField?.relateTo,
  ])

  const groupedEntities = useMemo(
    () =>
      entities.reduce(
        (res, entity) => ({
          ...res,
          [entity.data[kanbanField?.name || ''] as any]: [
            ...(res[entity.data[kanbanField?.name || ''] as string] || []),
            entity,
          ],
        }),
        // @ts-ignore
        (relationItems || kanbanField?.options || []).reduce(
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
        notification.error({
          message: 'Update unsuccessfully.',
        })
      },
    },
  )

  const colRefs = useRef<
    Record<string, ElementRef<typeof KanbanColumn> | null>
  >({})

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

      const type = colRefs.current[destination.droppableId]?.type
      if (type === DealStageType.CLOSED_LOST) {
        setSelectedId(draggableId)
        openLost()
      }

      if (type === DealStageType.CLOSED_WON) {
        setSelectedId(draggableId)
        openWon()
      }

      const dto = pick(entityMap.get(draggableId)!, ['data', 'name', 'id'])
      mutateAsync({ id: dto.id, name: dto.name, ...dto.data })
    },
    [module, dataKey, entities, isLoading],
  )

  if (!kanbanField || kanbanField.relateType === RelateType.MULTIPLE) {
    return <></>
  }

  return (
    <div className="flex gap-4 overflow-x-auto h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.keys(groupedEntities).map((key) => (
          <KanbanColumn
            ref={(ref) => (colRefs.current[key] = ref)}
            key={key}
            value={key}
            entities={groupedEntities[key]}
            field={kanbanField}
            module={module}
          />
        ))}
      </DragDropContext>

      <ConfirmStageModal
        close={closeWon}
        dataKey={dataKey}
        visible={confirmStageWon}
        fields={
          meta?.filter((field) => !!field.visibility['Confirm Stage Won']) || []
        }
        moduleName={module.name}
        entityId={selectedId}
        entity={entity}
      />

      <ConfirmStageModal
        close={closeLost}
        dataKey={dataKey}
        visible={confirmStageLost}
        fields={
          meta?.filter((field) => !!field.visibility['Confirm Stage Lost']) ||
          []
        }
        moduleName={module.name}
        entityId={selectedId}
        entity={entity}
      />
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

const typeToBg: Record<DealStageType | 'undefined', string> = {
  Open: '',
  'Close Lost': 'bg-red-500',
  'Close Won': 'bg-green-500',
  undefined: '',
}

type Ref = {
  type: DealStageType | undefined
}

const KanbanColumn = forwardRef<Ref, KanbanColumnProps>(function (
  { entities, value, field, module },
  ref,
) {
  const { kanban_meta: meta } = module
  const aggregation = useMemo(
    () =>
      aggrMap[module.kanban_meta?.aggregate_type || AggregateType.SUM](
        entities,
        module.kanban_meta?.aggregate_field!,
      ),
    [entities],
  )

  const cellRef = useRef<ElementRef<typeof RelationCell>>(null)

  useImperativeHandle(ref, () => ({
    type: cellRef.current?.type,
  }))

  return (
    <Droppable droppableId={value}>
      {({ droppableProps, innerRef, placeholder }) => (
        <div className="border rounded-md min-w-[250px]">
          <div
            className={`p-4 border-b rounded-t-md ${
              typeToBg[cellRef.current?.type || 'undefined']
            }`}
          >
            <div className="font-semibold">
              {field.relateTo && (
                <div>
                  <RelationCell
                    ref={cellRef}
                    relateTo={field.relateTo}
                    targetId={value}
                  />
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
})

type KanbanEntityProps = {
  entity: Entity
  index: number
  module: Module
}

function KanbanEntity({ entity, index, module }: KanbanEntityProps) {
  const [expand, _, __, toggle] = useModal(true)

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
                      ].some((type) => type === field.type) &&
                      !!field.visibility.Kanban,
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
