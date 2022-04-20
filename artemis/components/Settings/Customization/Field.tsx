import React from 'react'
import { Draggable } from 'react-beautiful-dnd'

export type TField = {
  id: string
  content: string
}

interface FieldProps {
  data: TField
  index: number
}

export const Field = ({ data: task, index }: FieldProps) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {({ dragHandleProps, draggableProps, innerRef }, { isDragging }) => (
        <div
          className={`border rounded-sm p-2 mb-2 bg-white ${
            isDragging ? 'bg-blue-50' : undefined
          }`}
          {...dragHandleProps}
          {...draggableProps}
          ref={innerRef}
        >
          {task.content}
        </div>
      )}
    </Draggable>
  )
}
