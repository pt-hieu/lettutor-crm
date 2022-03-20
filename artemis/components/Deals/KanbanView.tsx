import { notification } from 'antd'
import moment from 'moment'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from 'react-beautiful-dnd'
import { useMutation, useQueryClient } from 'react-query'

import ConfirmClosedLost from '@components/Deals/ConfirmClosedLost'
import ConfirmClosedWon from '@components/Deals/ConfirmClosedWon'

import Tooltip from '@utils/components/Tooltip'
import { useModal } from '@utils/hooks/useModal'
import {
  Deal,
  DealStage,
  DealStageData,
  DealStageType,
  UpdateDealDto,
} from '@utils/models/deal'
import { Paginate } from '@utils/models/paging'
import { Task } from '@utils/models/task'
import { updateDeal } from '@utils/service/deal'

type Props = {
  data: Paginate<Deal> | undefined
  queryKey: any
  dealStages: DealStageData[]
}

const stageToColorMappings: Partial<Record<DealStageType, string>> = {
  [DealStageType.CLOSED_LOST]: 'bg-red-500 text-white !border-b-red-300',
  [DealStageType.CLOSED_WON]: 'bg-green-500 text-white !border-b-green-300',
}

const stageNameToColorMappings: Partial<
  Record<DealStageType | 'default', string>
> = {
  [DealStageType.CLOSED_LOST]: 'group-hover:text-white',
  [DealStageType.CLOSED_WON]: 'group-hover:text-white',
  ['default']: 'group-hover:text-blue-600',
}

export default function KanbanView({
  queryKey,
  data: deals,
  dealStages,
}: Props) {
  const stageTypeById = useMemo(
    () =>
      dealStages.reduce(
        (sum, curr) => ({
          ...sum,
          [curr.id]: curr.type,
        }),
        {},
      ) as Record<string, DealStageType>,
    [dealStages],
  )

  const dealByStage = useMemo(
    () =>
      dealStages.reduce(
        (sum, curr) => ({
          ...sum,
          [curr.name]: deals?.items.filter(
            (deal) => deal?.stage?.name === curr.name,
          ),
        }),
        {},
      ) as Record<string, Deal[]>,
    [deals, dealStages],
  )

  const dealCount = useMemo(
    () =>
      (Object.keys(dealByStage) as DealStage[]).reduce(
        (sum, curr) => ({
          ...sum,
          [curr]: dealByStage[curr]?.length,
        }),
        {},
      ) as Record<string, number>,
    [dealByStage],
  )

  const amountCount = useMemo(
    () =>
      (Object.keys(dealByStage) as DealStage[]).reduce(
        (sum, curr) => ({
          ...sum,
          [curr]: dealByStage[curr]?.reduce(
            (sum, curr) => sum + (curr.amount || 0),
            0,
          ),
        }),
        {},
      ) as Record<string, number>,
    [dealByStage],
  )

  const nearestDueTask = useCallback((tasks: Task[]): Task | undefined => {
    const nearestTask = [...tasks].sort((a, b) =>
      moment(a.dueDate).isBefore(b.dueDate) ? -1 : 1,
    )[0]

    return moment().isBefore(nearestTask?.dueDate) ? nearestTask : undefined
  }, [])

  const [visibleConfirmClosedWon, openConfirmCloseWon, closeConfirmCloseWon] =
    useModal()
  const [
    visibleConfirmClosedLost,
    openConfirmCloseLost,
    closeConfirmCloseLost,
  ] = useModal()

  const client = useQueryClient()

  const { mutateAsync, isLoading } = useMutation(
    'update-deal-on-drag',
    updateDeal,
    {
      onMutate(varivables) {
        const newStageId = varivables.dealInfo.stageId
        const newStage = dealStages.find(
          (item) => item.id === newStageId,
        ) as DealStageData
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
        client.refetchQueries('deals')
      },
    },
  )

  const [dealId, setDealId] = useState<string | undefined>()
  const [closeStage, setCloseStage] = useState<
    DealStageType.CLOSED_LOST | undefined
  >()
  const [dealStageId, setDealStageId] = useState<string>('')

  const finishDeal = (dealId: string, updateDealDto: UpdateDealDto) => {
    const { stageId } = updateDealDto
    const stage = dealStages.find((s) => s.id === stageId)

    mutateAsync({
      id: dealId,
      dealInfo: { ...updateDealDto, probability: stage?.probability },
    })
  }

  const handleDragEnd: OnDragEndResponder = useCallback((res) => {
    if (!res.destination) return

    const stageId = res.destination.droppableId

    if (stageId === res.source.droppableId) return

    const dealId = res.draggableId

    if (stageTypeById[stageId] === DealStageType.CLOSED_WON) {
      setDealId(dealId)
      setDealStageId(stageId)
      openConfirmCloseWon()
      return
    }

    if (
      stageTypeById[res.destination.droppableId] === DealStageType.CLOSED_LOST
    ) {
      setDealId(dealId)
      setDealStageId(stageId)
      setCloseStage(
        stageTypeById[res.destination.droppableId] as DealStageType.CLOSED_LOST,
      )
      openConfirmCloseLost()
      return
    }

    //auto update probability
    const stage = dealStages.find((s) => s.id === stageId)
    mutateAsync({
      id: dealId,
      dealInfo: { stageId, probability: stage?.probability },
    })
  }, [])

  const chosenDeal = deals?.items.find((deal) => deal.id === dealId)

  return (
    <div className="w-full overflow-x-auto flex gap-3 min-h-[calc(100vh-204px)] crm-scrollbar pb-4">
      {chosenDeal && (
        <ConfirmClosedWon
          stageId={dealStageId}
          deal={chosenDeal}
          visible={visibleConfirmClosedWon}
          onCloseModal={closeConfirmCloseWon}
          onUpdateDeal={finishDeal}
        />
      )}
      {chosenDeal && closeStage && (
        <ConfirmClosedLost
          deal={chosenDeal}
          stageId={dealStageId}
          visible={visibleConfirmClosedLost}
          onCloseModal={closeConfirmCloseLost}
          onUpdateDeal={finishDeal}
        />
      )}
      <DragDropContext onDragEnd={handleDragEnd}>
        {dealStages.map((stage) => (
          <Droppable
            isDropDisabled={isLoading}
            key={stage.id}
            droppableId={stage.id}
          >
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="min-w-[300px] flex flex-col gap-2 group pr-[10px]"
              >
                <div
                  className={`p-4 border border-b-[3px] border-b-blue-600 ${
                    stageToColorMappings[stage.type]
                  } rounded-md group-hover:shadow-md crm-transition select-none`}
                >
                  <div
                    className={`font-medium text-[15px] ${
                      stageNameToColorMappings[stage.type] ||
                      stageNameToColorMappings['default']
                    } crm-transition`}
                  >
                    {stage.name}
                  </div>
                  <div className="flex items-center ">
                    <span>${amountCount[stage.name]}</span>

                    <span className="mx-2 fa fa-angle-right" />
                    <span>{dealCount[stage.name]} deals</span>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-293px)] crm-transition flex flex-col gap-2 overflow-auto crm-scrollbar pr-2 mr-[-15px]">
                  {dealByStage[stage.name]?.map(
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

                            <Tooltip title="Owner">
                              {owner && (
                                <span>
                                  {owner?.name}
                                  <br />
                                </span>
                              )}
                            </Tooltip>

                            <Tooltip title="Account">
                              {account && (
                                <span>
                                  {account?.fullName}
                                  <br />
                                </span>
                              )}
                            </Tooltip>

                            <Tooltip title="Contact">
                              {contact && (
                                <span>
                                  {contact?.fullName}
                                  <br />
                                </span>
                              )}
                            </Tooltip>

                            <Tooltip title="Amount">
                              {amount && (
                                <span>
                                  {amount && `$${amount}`}
                                  <br />
                                </span>
                              )}
                            </Tooltip>

                            <div className="my-2 border-b" />

                            <div className="flex justify-between">
                              <Tooltip title="Closing Date">
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
