import IndeterminateCheckbox from '@utils/components/IndeterminateCheckbox'
import { Role } from '@utils/models/role'
import Action from './Action'
import { Draggable, Droppable } from 'react-beautiful-dnd'

type Props = {
  role?: Role
  disabled?: boolean
}

export default function ActionPanel({ role, disabled }: Props) {
  return (
    <Droppable droppableId="action" isDropDisabled={disabled}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="flex flex-col items-center"
        >
          <div className="flex gap-2 items-center">
            <IndeterminateCheckbox
              indeterminate={false}
              type="checkbox"
              className="crm-input"
            />
            <span className="font-medium text-[17px]">Actions</span>
          </div>

          <div className="mt-4 w-full flex flex-col gap-2">
            {role?.actions.map((action, index) => (
              <Draggable
                draggableId={action}
                isDragDisabled={disabled}
                key={action + 'alreadyhaveaction'}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Action data={action} />
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
