import { Draggable } from 'react-beautiful-dnd'

import { Column } from './Column'
import { TField } from './Field'

interface SectionProps {
  id: string
  title: string
  fieldsColumn1: TField[]
  fieldsColumn2: TField[]
  index: number
}

export const SEPERATOR = '@'

export const Section = ({
  id,
  title,
  fieldsColumn1,
  fieldsColumn2,
  index,
}: SectionProps) => {
  return (
    <Draggable draggableId={id} index={index}>
      {({ draggableProps, innerRef, dragHandleProps }, { isDragging }) => (
        <div
          ref={innerRef}
          {...draggableProps}
          className={`my-4 border border-dashed hover:border-gray-400 rounded-sm p-2 ${
            isDragging ? 'border-blue-600 bg-slate-50' : ''
          }`}
        >
          <h3 className="p-2 !cursor-move" {...dragHandleProps}>
            {title}
          </h3>
          <div className="flex items-stretch">
            <div className="flex-1">
              <Column id={id + SEPERATOR + 1} fields={fieldsColumn1} />
            </div>
            <div className="flex-1">
              <Column id={id + SEPERATOR + 2} fields={fieldsColumn2} />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
