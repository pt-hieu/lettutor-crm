import { Draggable, Droppable, resetServerContext } from 'react-beautiful-dnd'

import { useDispatch } from '@utils/hooks/useDispatch'
import { FieldType } from '@utils/models/module'

resetServerContext()

const icons: Record<FieldType, string> = {
  [FieldType.CHECK_BOX]: 'fa-check',
  [FieldType.DATE]: 'fa-calendar',
  [FieldType.EMAIL]: 'fa-envelope',
  [FieldType.MULTILINE_TEXT]: 'fa-heading',
  [FieldType.NUMBER]: 'fa-1',
  [FieldType.PHONE]: 'fa-phone',
  [FieldType.RELATION]: 'fa-circle-nodes',
  [FieldType.TEXT]: 'fa-font',
  [FieldType.SELECT]: 'fa-caret-down',
}

export default function FieldSelector() {
  const dispatch = useDispatch()

  return (
    <Droppable droppableId="selector" isDropDisabled>
      {({ droppableProps, placeholder, innerRef }) => (
        <div ref={innerRef} {...droppableProps}>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(FieldType).map((type, index) => (
              <Draggable key={type} draggableId={type} index={index}>
                {(
                  { draggableProps, innerRef, dragHandleProps },
                  { isDragging },
                ) => (
                  <>
                    <div
                      className={`px-3 py-2 border rounded-md bg-white grid grid-cols-[15px,1fr] gap-2 items-center ${
                        isDragging ? 'border-dashed' : ''
                      }`}
                      ref={innerRef}
                      {...draggableProps}
                      {...dragHandleProps}
                      style={draggableProps.style}
                    >
                      <span className={`fa ${icons[type]}`} />
                      {type}
                    </div>

                    {isDragging && (
                      <div className="px-3 py-2 border rounded-md bg-white grid grid-cols-[15px,1fr] gap-2 items-center ">
                        <span className={`fa ${icons[type]}`} />
                        {type}
                      </div>
                    )}
                  </>
                )}
              </Draggable>
            ))}
          </div>

          <button
            onClick={() => dispatch('cmd:open-group-modal')}
            className="px-3 py-2 border rounded-md bg-white mt-4 text-center w-full"
          >
            <span className="fa fa-plus mr-2" />
            New Group
          </button>

          {placeholder}
        </div>
      )}
    </Droppable>
  )
}
