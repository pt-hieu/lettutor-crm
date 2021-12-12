import IndeterminateCheckbox from '@utils/components/IndeterminateCheckbox'
import { Actions, Role } from '@utils/models/role'
import { useMemo } from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import Action from './Action'

type Props = {
  data?: Role
}

export default function AvailableActionPanel({ data }: Props) {
  const availableActions = useMemo(
    () =>
      Object.values(Actions).filter(
        (action) => !data?.actions.includes(action),
      ),
    [data],
  )

  const isDisabled = useMemo(
    () => !data || !availableActions.length,
    [data, availableActions],
  )

  return (
    <Droppable droppableId="available-action">
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

          <div className="mt-4 w-full">
            {availableActions.map((action, index) => (
              <Draggable
                draggableId={action}
                key={action + 'alreadyhaveaction'}
                index={index}
                isDragDisabled={isDisabled}
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
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  )
}
