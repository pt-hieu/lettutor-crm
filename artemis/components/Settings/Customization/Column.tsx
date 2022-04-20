import { Droppable } from 'react-beautiful-dnd'

import { Field, TField } from './Field'

interface ColumnProps {
  fields: TField[]
  id: string
}

export const Column = ({ id, fields }: ColumnProps) => {
  return (
    <Droppable droppableId={id} type="field">
      {({ innerRef, droppableProps, placeholder }, { isDraggingOver }) => (
        <div
          className={`p-2 relative h-full min-h-[100px] ${
            isDraggingOver
              ? 'border border-blue-400 rounded-sm border-dashed'
              : undefined
          }`}
          ref={innerRef}
          {...droppableProps}
        >
          {fields.map((field, index) => (
            <Field key={field.id} data={field} index={index} />
          ))}
          {placeholder}
        </div>
      )}
    </Droppable>
  )
}
