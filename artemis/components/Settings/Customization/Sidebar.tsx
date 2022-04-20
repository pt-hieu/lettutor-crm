import React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'

export const Sidebar = () => {
  return (
    <div className="bg-gray-600 text-white h-full w-full p-5 flex flex-col gap-2">
      <div>Side bar</div>
      <Droppable droppableId="new-fields" type="field" isDropDisabled>
        {({ innerRef, droppableProps }) => (
          <div
            className="grid grid-cols-2 gap-2 auto-rows-[32px]"
            ref={innerRef}
            {...droppableProps}
          >
            {[...Array(10).keys()].map((i, index) => (
              <Item key={i} content={i} index={index} />
            ))}
          </div>
        )}
      </Droppable>
      <Droppable droppableId="new-section" type="section" isDropDisabled>
        {({ innerRef, droppableProps }) => (
          <div ref={innerRef} {...droppableProps}>
            <Draggable draggableId={'new-section'} index={1}>
              {(
                { draggableProps, innerRef, dragHandleProps },
                { isDragging },
              ) => (
                <div
                  ref={innerRef}
                  {...draggableProps}
                  className={`my-4 border border-dashed hover:border-gray-400 rounded-sm ${
                    isDragging
                      ? 'border-gray-400 bg-orange-50'
                      : 'border-transparent '
                  }`}
                >
                  <h3 className="p-2 !cursor-move" {...dragHandleProps}>
                    New Section
                  </h3>
                  <div className="flex items-stretch">
                    <div className="flex-1">
                      {/* <Column id={id + SEPERATOR + 1} fields={fieldsColumn1} /> */}
                    </div>
                    <div className="flex-1">
                      {/* <Column id={id + SEPERATOR + 2} fields={fieldsColumn2} /> */}
                    </div>
                  </div>
                </div>
              )}
            </Draggable>
          </div>
        )}
      </Droppable>
    </div>
  )
}

interface ItemProps {
  content: number
  index: number
}
const Item = ({ content, index }: ItemProps) => {
  return (
    <div className="border rounded-sm relative hover:bg-orange-50 text-gray-700 bg-slate-50">
      {content}

      <Draggable draggableId={`i${index}`} index={index}>
        {({ dragHandleProps, draggableProps, innerRef }, { isDragging }) => (
          <div
            {...dragHandleProps}
            {...draggableProps}
            ref={innerRef}
            className={`rounded-sm absolute inset-0 z-[1000] h-10 ${
              isDragging
                ? 'bg-orange-50 opacity-100 !w-[460px] border border-orange-300'
                : 'opacity-0 hover:bg-slate-50'
            } `}
          >
            {content}
          </div>
        )}
      </Draggable>
    </div>
  )
}
