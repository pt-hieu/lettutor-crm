import { Droppable } from 'react-beautiful-dnd'

import { Field, TField } from './Field'

interface ColumnProps {
  fields: TField[]
  id: string
}

export const Column = ({ id, fields }: ColumnProps) => {
  return (
    <Droppable droppableId={id} type="field">
      {({ innerRef, droppableProps, placeholder }) => (
        <div className="p-2 relative h-full" ref={innerRef} {...droppableProps}>
          {fields.map((task, index) => (
            <Field key={task.id} task={task} index={index} />
          ))}
          {placeholder}
        </div>
      )}
    </Droppable>
  )
}
