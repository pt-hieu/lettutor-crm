import { Deal, DealStage } from '@utils/models/deal'
import { Paginate } from '@utils/models/paging'
import { notification, Tooltip } from 'antd'
import moment from 'moment'
import { useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Draggable,
  Droppable,
  DragDropContext,
  OnDragEndResponder,
} from 'react-beautiful-dnd'
import { Task } from '@utils/models/task'
import { useMutation, useQueryClient } from 'react-query'
import { updateDeal } from '@utils/service/deal'

type Props = {
  data: Paginate<Deal> | undefined
  queryKey: any
}

const stageToColorMappings: Partial<Record<DealStage, string>> = {
  [DealStage.CLOSED_LOST]: 'bg-red-500 text-white !border-b-red-300',
  [DealStage.CLOSED_LOST_TO_COMPETITION]:
    'bg-red-500 text-white !border-b-red-300',
  [DealStage.CLOSED_WON]: 'bg-green-500 text-white !border-b-green-300',
}

const stageNameToColorMappings: Partial<Record<DealStage | 'default', string>> =
  {
    [DealStage.CLOSED_LOST]: 'group-hover:text-white',
    [DealStage.CLOSED_WON]: 'group-hover:text-white',
    [DealStage.CLOSED_LOST_TO_COMPETITION]: 'group-hover:text-white',
    ['default']: 'group-hover:text-blue-600',
  }

export default function KanbanView({ queryKey, data: deals }: Props) {
  const dealByStage = useMemo(
    () =>
      Object.values(DealStage).reduce(
        (sum, curr) => ({
          ...sum,
          [curr]: deals?.items.filter((deal) => deal.stage === curr),
        }),
        {},
      ) as Record<DealStage, Deal[]>,
    [deals],
  )

  const dealCount = useMemo(
    () =>
      (Object.keys(dealByStage) as DealStage[]).reduce(
        (sum, curr) => ({
          ...sum,
          [curr]: dealByStage[curr].length,
        }),
        {},
      ) as Record<DealStage, number>,
    [dealByStage],
  )

  const amountCount = useMemo(
    () =>
      (Object.keys(dealByStage) as DealStage[]).reduce(
        (sum, curr) => ({
          ...sum,
          [curr]: dealByStage[curr].reduce(
            (sum, curr) => sum + (curr.amount || 0),
            0,
          ),
        }),
        {},
      ) as Record<DealStage, number>,
    [dealByStage],
  )

  const nearestDueTask = useCallback((tasks: Task[]): Task | undefined => {
    const nearestTask = [...tasks].sort((a, b) =>
      moment(a.dueDate).isBefore(b.dueDate) ? -1 : 1,
    )[0]

    return moment().isBefore(nearestTask?.dueDate) ? nearestTask : undefined
  }, [])

  const client = useQueryClient()

  const { mutateAsync, isLoading } = useMutation(
    'update-deal-on-drag',
    updateDeal,
    {
      onMutate(varivables) {
        const newStage = varivables.dealInfo.stage as DealStage
        client.setQueryData(queryKey, (deals: Paginate<Deal> | undefined) => ({
          meta: deals!.meta,
          items: deals!.items.map((deal) => ({
            ...deal,
            stage: deal.id === varivables.id ? newStage : deal.stage,
          })),
        })) as Paginate<Deal>
      },
      onSuccess() {
        notification.success({ message: 'Update deal successfully' })
      },
      onError() {
        notification.error({ message: 'Update deal unsuccessfully' })
      },
      onSettled() {
        client.invalidateQueries('deals')
      },
    },
  )

  const handleDragEnd: OnDragEndResponder = useCallback((res) => {
    if (!res.destination) return
    if (res.destination.droppableId === res.source.droppableId) return

    // HLC-79, HLC-80: here

    mutateAsync({
      id: res.draggableId,
      dealInfo: { stage: res.destination.droppableId },
    })
  }, [])

  return (
    <div className="w-full overflow-x-auto flex gap-3 min-h-[calc(100vh-204px)] crm-scrollbar pb-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.values(DealStage).map((stage) => (
          <Droppable isDropDisabled={isLoading} key={stage} droppableId={stage}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="min-w-[300px] flex flex-col gap-2 group pr-[10px]"
              >
                <div
                  className={`p-4 border border-b-[3px] border-b-blue-600 ${stageToColorMappings[stage]} rounded-md group-hover:shadow-md crm-transition select-none`}
                >
                  <div
                    className={`font-medium text-[15px] ${
                      stageNameToColorMappings[stage] ||
                      stageNameToColorMappings['default']
                    } crm-transition`}
                  >
                    {stage}
                  </div>
                  <div className="flex items-center ">
                    <span>${amountCount[stage]}</span>

                    <span className="mx-2 fa fa-angle-right" />
                    <span>{dealCount[stage]} deals</span>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-293px)] crm-transition flex flex-col gap-2 overflow-auto crm-scrollbar pr-2 mr-[-15px]">
                  {dealByStage[stage].map(
                    (
                      {
                        id,
                        owner,
                        fullName,
                        closingDate,
                        amount,
                        account,
                        contact,
                        tasks,
                      },
                      index,
                    ) => (
                      <Draggable
                        isDragDisabled={isLoading}
                        key={id}
                        index={index}
                        draggableId={id}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            className="border rounded-md p-4 bg-white"
                          >
                            <Link href={`/deals/${id}`}>
                              <a className="block crm-link hover:text-current font-medium pb-2 mb-2 border-b ">
                                {fullName}
                              </a>
                            </Link>

                            <Tooltip title="Owner" placement="right">
                              {owner && (
                                <span>
                                  {owner?.name}
                                  <br />
                                </span>
                              )}
                            </Tooltip>

                            <Tooltip title="Account" placement="right">
                              {account && (
                                <span>
                                  {account?.fullName}
                                  <br />
                                </span>
                              )}
                            </Tooltip>

                            <Tooltip title="Contact" placement="right">
                              {contact && (
                                <span>
                                  {contact?.fullName}
                                  <br />
                                </span>
                              )}
                            </Tooltip>

                            <Tooltip title="Amount" placement="right">
                              {amount && (
                                <span>
                                  {amount && `$${amount}`}
                                  <br />
                                </span>
                              )}
                            </Tooltip>

                            <div className="my-2 border-b" />

                            <div className="flex justify-between">
                              <Tooltip
                                title="Closing Date"
                                placement={'bottom'}
                              >
                                <span className="text-red-500">
                                  {moment(closingDate).format('DD/MM/YYYY')}
                                </span>
                              </Tooltip>

                              {[1].map(() => {
                                const task = nearestDueTask(tasks || [])
                                return (
                                  task && (
                                    <Tooltip
                                      key={1}
                                      title={`${moment(task.dueDate).format(
                                        'MMMM DD',
                                      )} - ${task.subject}`}
                                      placement={'bottom'}
                                    >
                                      <div>
                                        <Link href={`/tasks/${task.id}`}>
                                          <a className="crm-link text-red-500 hover:text-red-500">
                                            <span className="fa fa-tasks" />
                                          </a>
                                        </Link>
                                      </div>
                                    </Tooltip>
                                  )
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ),
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  )
}
