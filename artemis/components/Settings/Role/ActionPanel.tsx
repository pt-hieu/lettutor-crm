import IndeterminateCheckbox from '@utils/components/IndeterminateCheckbox'
import { Actions, ActionScope, Role } from '@utils/models/role'
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
            {Object.values(ActionScope).map((scope) => {
              const actions = Object.values(Actions[scope]).filter(
                (scopedAction) =>
                  role?.actions.some((action) => action === scopedAction),
              )

              if (!actions.length) return null
              console.log(actions);
              

              return (
                <div key={scope}>
                  <div className="font-semibold mb-3 pl-[24px] text-[17px]">
                    {scope}
                  </div>
                  <div className="flex flex-col gap-2">
                    {actions.map((action, index) => (
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
