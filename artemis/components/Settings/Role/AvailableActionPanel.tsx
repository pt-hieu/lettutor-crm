import IndeterminateCheckbox from '@utils/components/IndeterminateCheckbox'
import { Actions, ActionScope, Role } from '@utils/models/role'
import { useMemo } from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import Action from './Action'

type Props = {
  data?: Role
  disabled?: boolean
}

export default function AvailableActionPanel({ data, disabled }: Props) {
  const availableActions = useMemo(
    () =>
      Object.values(Actions)
        .map((scope) => Object.values(scope))
        .flat()
        .filter((action) => !data?.actions.includes(action)),
    [data],
  )

  const isDisabled = useMemo(
    () => !data || !availableActions.length,
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
            {Object.values(ActionScope).map((scope) => {
              const actions = Object.values(Actions[scope]).filter(
                (scopedAction) =>
                  availableActions.some((action) => action === scopedAction),
              )

              if (!actions.length) return null
              return (
                <div key={scope}>
                  <div className='font-semibold mb-3 pl-[24px] text-[17px]'>{scope}</div>
                  <div className='flex flex-col gap-2'>
                    {actions.map((action, index) => (
                      <Draggable
                        draggableId={action}
                        key={action + 'alreadyhaveaction'}
                        index={index}
                        isDragDisabled={isDisabled || disabled}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Action disabled={isDisabled} data={action} />
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
