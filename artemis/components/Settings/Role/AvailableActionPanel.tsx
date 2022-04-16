import { useMemo } from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'

import ActionType from '@components/Settings/Role/ActionType'

import IndeterminateCheckbox from '@utils/components/IndeterminateCheckbox'
import { Action, Role } from '@utils/models/role'

type Props = {
  data?: Role
  availableActions: Action[]
  actionScope: string[]
  disabled?: boolean
}

export default function AvailableActionPanel({
  data,
  disabled,
  availableActions,
  actionScope,
}: Props) {
  const isDisabled = useMemo(
    () => !data || !availableActions?.length,
    [data, availableActions],
  )

  return (
    <Droppable droppableId="available-action" isDropDisabled={disabled}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="flex flex-col items-center"
        >
          <div className="flex gap-2 items-center">
            <IndeterminateCheckbox
              disabled={isDisabled}
              indeterminate={false}
              type="checkbox"
              className="crm-input"
            />
            <span className="font-medium text-[17px]">Available Actions</span>
          </div>

          <div className="mt-4 w-full h-[calc(100vh-60px-145px)] pr-2 crm-scrollbar  flex flex-col gap-2 overflow-auto">
            {actionScope?.map((scope) => {
              const actions = availableActions?.filter(
                (action) => action.target === scope,
              )

              if (!actions?.length) return null

              return (
                <div key={scope}>
                  <div className="font-semibold mb-3 pl-[24px] text-[17px]">
                    {scope}
                  </div>
                  <div className="flex flex-col gap-2">
                    {actions.map((action, index) => (
                      <Draggable
                        draggableId={action.id}
                        key={action.id + 'alreadyhaveaction'}
                        index={index}
                        isDragDisabled={isDisabled || disabled}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ActionType
                              disabled={isDisabled}
                              data={action.type}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                </div>
              )
            })}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  )
}
