import React, { useContext } from 'react'
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd'

import { OptionsContext } from './Field'
import { RenameInput } from './RenameInput'

interface Props {
  options: string[]
  onChange: (newOptions: string[]) => void
}

export const PickList = ({ options, onChange }: Props) => {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return

    const sourceId = source.droppableId
    const destinationId = destination.droppableId

    if (destinationId === sourceId && destination.index === source.index) return

    const newOptions = [...options]

    newOptions.splice(source.index, 1)
    newOptions.splice(destination.index, 0, draggableId)

    onChange(newOptions)
  }

  return (
    <div className="w-full max-h-[300px] rounded-md p-4 flex flex-col gap-2 border overflow-y-auto crm-scrollbar">
      {options.length ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="pick-list">
            {({ droppableProps, innerRef, placeholder }) => (
              <div
                ref={innerRef}
                {...droppableProps}
                className="h-full flex flex-col gap-2"
              >
                {options.map((option, index) => {
                  return <PickItem key={option} data={option} index={index} />
                })}
                {placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <button
          className="crm-icon-btn text-blue-500 hover:text-blue-400 hover:border-blue-500 text-[15px] self-center"
          onClick={() => onChange([''])}
        >
          <span className="fa fa-plus"></span>
        </button>
      )}
    </div>
  )
}

interface ItemProps {
  data: string
  index: number
}

const PickItem = ({ data, index }: ItemProps) => {
  const { onAdd, onDelete, onRename } = useContext(OptionsContext)!
  return (
    <Draggable draggableId={data || new Date().toISOString()} index={index}>
      {({ draggableProps, innerRef, dragHandleProps }, { isDragging }) => (
        <div
          ref={innerRef}
          {...draggableProps}
          {...dragHandleProps}
          className={` hover:border-blue-400 border-dashed rounded-sm min-h-[40px] border flex-1 flex items-center p-2 justify-between group ${
            isDragging ? 'border-blue-500 bg-blue-50' : ''
          }`}
        >
          <RenameInput
            initialValue={data}
            onRename={(name) => onRename(index, name)}
            autoFocus={data === ''}
          />
          <div className="flex gap-2">
            <button
              className="crm-icon-btn hidden text-gray-600 group-hover:block border-transparent hover:border-red-400 hover:text-red-400"
              onClick={() => onDelete(index)}
            >
              <span className="fa fa-times"></span>
            </button>

            <button
              className="crm-icon-btn text-blue-500 hover:text-blue-400 hover:border-blue-500 text-[15px]"
              onClick={() => onAdd(index + 1)}
            >
              <span className="fa fa-plus"></span>
            </button>
          </div>
        </div>
      )}
    </Draggable>
  )
}
