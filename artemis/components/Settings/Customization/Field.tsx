import React from 'react'
import { Draggable } from 'react-beautiful-dnd'

import { ActionType } from '@utils/models/customization'
import { FieldMeta, FieldType } from '@utils/models/module'

export type TFieldData = Omit<FieldMeta, 'group'> & {
  id: string
  action?: ActionType
}

interface FieldProps {
  data: TFieldData
  index: number
}

export const Field = ({ data, index }: FieldProps) => {
  return (
    <Draggable draggableId={data.id} index={index}>
      {({ dragHandleProps, draggableProps, innerRef }, { isDragging }) => (
        <div
          className={`border rounded-sm p-2 mb-2 bg-white ${
            isDragging ? 'bg-blue-50' : undefined
          }`}
          {...dragHandleProps}
          {...draggableProps}
          ref={innerRef}
        >
          {data.name}
        </div>
      )}
    </Draggable>
  )
}
