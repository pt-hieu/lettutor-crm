import { Draggable, Droppable } from 'react-beautiful-dnd'

import ActionType from '@components/Settings/Role/ActionType'

import IndeterminateCheckbox from '@utils/components/IndeterminateCheckbox'
import { Role } from '@utils/models/role'

type Props = {
  role?: Role
  disabled?: boolean
}

export default function ActionPanel({ role, disabled }: Props) {
  const actionScope = role?.actions
    ?.map((action) => action.target)
    .filter((value, index, self) => self.indexOf(value) === index)

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
            {actionScope?.map((scope) => {
              const actions = role?.actions?.filter(
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
                        isDragDisabled={disabled}
                        key={action.id + 'alreadyhaveaction'}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ActionType data={action.type} />
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
