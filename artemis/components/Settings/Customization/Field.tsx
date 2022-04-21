import { FieldsContext } from 'pages/settings/modules/lead'
import React, { ReactNode, useContext } from 'react'
import { Draggable } from 'react-beautiful-dnd'

import Confirm from '@utils/components/Confirm'
import Dropdown from '@utils/components/Dropdown'
import Menu from '@utils/components/Menu'
import { useModal } from '@utils/hooks/useModal'
import { ActionType } from '@utils/models/customization'
import { FieldMeta, FieldType } from '@utils/models/module'

export type TFieldData = Omit<FieldMeta, 'group'> & {
  id: string
  action?: ActionType
}

interface FieldProps {
  data: TFieldData
  index: number
  isPure?: boolean
}

const MapFieldType: Record<FieldType, ReactNode> = {
  [FieldType.TEXT]: 'Single line',
  [FieldType.EMAIL]: 'Email',
  [FieldType.MULTILINE_TEXT]: 'Multi-line',
  [FieldType.NUMBER]: 'Number',
  [FieldType.DATE]: 'Date',
  [FieldType.PHONE]: 'Phone',
  [FieldType.SELECT]: (
    <div className="border border-gray-200 rounded-sm p-1 px-2 max-w-fit -ml-2">
      Option 1 <span className="fa fa-caret-down ml-1"></span>
    </div>
  ),
  [FieldType.RELATION]: 'Lookup',
}

export const Field = React.memo(({ data, index, isPure }: FieldProps) => {
  const { id, name, type } = data
  const { onDelete, onUpdate } = useContext(FieldsContext)!

  const [confirm, showConfirm, hideConfirm] = useModal()

  const handleDelete = () => onDelete(id)

  const options = [
    {
      key: 'Delete',
      title: (
        <span className="text-red-500">
          <span className="fa fa-trash mr-2"></span>Delete Permanently
        </span>
      ),
      action: showConfirm,
    },
  ]

  return (
    <>
      <Draggable draggableId={id} index={index}>
        {({ dragHandleProps, draggableProps, innerRef }, { isDragging }) => (
          <div
            className={`border rounded-sm p-2 mb-2 bg-white flex justify-between items-center hover:border-orange-300 ${
              isPure ? 'opacity-0 !w-[460px] text-gray-500' : undefined
            } ${
              isDragging
                ? 'bg-orange-50 border-orange-400 opacity-100'
                : undefined
            }`}
            {...dragHandleProps}
            {...draggableProps}
            ref={innerRef}
          >
            <div className="w-[180px] truncate ml-2">{name}</div>
            <div className="flex-1 mx-2 text-gray-400">
              {MapFieldType[type]}
            </div>
            <Dropdown
              key={'dropdown' + index}
              triggerOnHover={false}
              overlay={
                options.length ? (
                  <Menu
                    className="min-w-[250px]"
                    items={options.map(({ key, title, action }) => ({
                      key,
                      title,
                      action,
                    }))}
                  />
                ) : (
                  <div></div>
                )
              }
            >
              <button className="crm-button-icon w-8 aspect-square rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900">
                <span className="fa fa-ellipsis-h" />
              </button>
            </Dropdown>
          </div>
        )}
      </Draggable>
      <Confirm
        visible={confirm}
        close={hideConfirm}
        message={`Are you sure you want to remove the field?`}
        onYes={handleDelete}
      />
    </>
  )
})