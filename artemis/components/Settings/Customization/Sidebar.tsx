import React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'

import { FieldType } from '@utils/models/module'

import { Field, TFieldData } from './Field'

export const pureFields: Record<FieldType, TFieldData> = {
  [FieldType.TEXT]: {
    id: FieldType.TEXT,
    name: 'Single Line',
    required: false,
    type: FieldType.TEXT,
    visibility: {},
  },
  [FieldType.MULTILINE_TEXT]: {
    id: FieldType.MULTILINE_TEXT,
    name: 'Multi Line',
    required: false,
    type: FieldType.MULTILINE_TEXT,
    visibility: {},
  },
  [FieldType.EMAIL]: {
    id: FieldType.EMAIL,
    name: 'Email',
    required: false,
    type: FieldType.EMAIL,
    visibility: {},
  },
  [FieldType.PHONE]: {
    id: FieldType.PHONE,
    name: 'Phone',
    required: false,
    type: FieldType.PHONE,
    visibility: {},
  },
  [FieldType.NUMBER]: {
    id: FieldType.NUMBER,
    name: 'Number',
    required: false,
    type: FieldType.NUMBER,
    visibility: {},
  },
  [FieldType.DATE]: {
    id: FieldType.DATE,
    name: 'Date',
    required: false,
    type: FieldType.DATE,
    visibility: {},
  },
  [FieldType.SELECT]: {
    id: FieldType.SELECT,
    name: 'Pick List',
    required: false,
    type: FieldType.SELECT,
    visibility: {},
  },
  [FieldType.RELATION]: {
    id: FieldType.RELATION,
    name: 'Lookup',
    required: false,
    type: FieldType.RELATION,
    visibility: {},
  },
}

const mapIcon: Record<FieldType, string> = {
  [FieldType.TEXT]: 'fa-minus',
  [FieldType.EMAIL]: 'fa-envelope',
  [FieldType.MULTILINE_TEXT]: 'fa-bars',
  [FieldType.NUMBER]: 'fa-sort-numeric-asc',
  [FieldType.DATE]: 'fa-calendar',
  [FieldType.PHONE]: 'fa-phone',
  [FieldType.SELECT]: 'fa-list-alt',
  [FieldType.RELATION]: 'fa-eye',
}

interface ItemProps {
  data: TFieldData
  index: number
}
const FieldItem = ({ data, index }: ItemProps) => {
  return (
    <div className="border rounded-sm relative hover:bg-orange-50 bg-slate-50 px-2 flex items-center">
      <span className="text-gray-600">
        <span className={`fa ${mapIcon[data.type]} mr-1`}></span> {data.name}
      </span>

      <div className="inset-0 absolute">
        <Field data={data} index={index} isPure={true} />
      </div>
    </div>
  )
}

export type TSection = {
  id: string
  title: string
  fieldIds1: string[]
  fieldIds2: string[]
}

export type TSectionData = TSection & { actions?: string }

interface SectionItemProps {
  data: TFieldData
  index: number
}

const SectionItem = ({ data, index }: ItemProps) => {
  return (
    <div className="border rounded-sm relative hover:bg-orange-50 bg-slate-50 px-2 flex items-center">
      <span className="text-gray-600">
        <span className={`fa ${mapIcon[data.type]} mr-1`}></span> {data.name}
      </span>

      <div className="inset-0 absolute">
        <Field data={data} index={index} isPure={true} />
      </div>
    </div>
  )
}

export const Sidebar = () => {
  return (
    <div className="bg-gray-600 text-white h-full w-full p-5 flex flex-col gap-2">
      <div>Side bar</div>
      <Droppable droppableId="new-field" type="field" isDropDisabled>
        {({ innerRef, droppableProps }) => (
          <div
            className="grid grid-cols-2 gap-2 auto-rows-[32px]"
            ref={innerRef}
            {...droppableProps}
          >
            {Object.entries(pureFields).map(([key, data], index) => (
              <FieldItem key={key} data={data} index={index} />
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
