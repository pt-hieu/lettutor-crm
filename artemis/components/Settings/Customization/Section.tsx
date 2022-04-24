import { Draggable } from 'react-beautiful-dnd'

import Confirm from '@utils/components/Confirm'
import Dropdown from '@utils/components/Dropdown'
import Menu from '@utils/components/Menu'
import { useModal } from '@utils/hooks/useModal'

import { Column } from './Column'
import { TFieldData } from './Field'
import { RenameInput } from './RenameInput'

interface SectionProps {
  id: string
  name: string
  fieldsColumn1: TFieldData[]
  fieldsColumn2: TFieldData[]
  index: number
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

export const SEPERATOR = '@'

export const Section = ({
  id,
  name,
  fieldsColumn1,
  fieldsColumn2,
  index,
  onDelete,
  onRename,
}: SectionProps) => {
  const [confirm, showConfirm, hideConfirm] = useModal()
  const handleDelete = () => onDelete(id)

  const options = [
    {
      key: 'Delete',
      title: (
        <span className="text-red-500">
          <span className="fa fa-trash mr-2"></span>Delete Section
        </span>
      ),
      action: showConfirm,
    },
  ]

  const totalFields = [...fieldsColumn1, ...fieldsColumn2]

  return (
    <>
      <Draggable draggableId={id} index={index}>
        {({ draggableProps, innerRef, dragHandleProps }, { isDragging }) => (
          <div
            ref={innerRef}
            {...draggableProps}
            className={`border border-dashed hover:border-gray-400 rounded-sm p-2 relative ${
              isDragging ? 'border-blue-600 bg-slate-50' : ''
            }`}
          >
            <div className="p-2 !cursor-move flex" {...dragHandleProps}>
              <RenameInput
                className="text-gray-700 font-semibold text-[17px]"
                initialValue={name}
                onRename={(name) => onRename(id, name)}
              />
            </div>
            <div className="flex items-stretch relative">
              <div className="flex-1">
                <Column id={id + SEPERATOR + 1} fields={fieldsColumn1} />
              </div>
              <div className="flex-1">
                <Column id={id + SEPERATOR + 2} fields={fieldsColumn2} />
              </div>
              {!totalFields.length && (
                <div className="absolute top-[50%] text-center left-[50%] -translate-x-[50%] -translate-y-[50%] text-gray-400 font-semibold">
                  Drag and drop your fields here
                </div>
              )}
            </div>
            <div className="absolute top-2 right-2">
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
                <button className="crm-button-icon w-8 aspect-square rounded-full hover:bg-gray-200 text-gray-600 hover:text-gray-900">
                  <span className="fa fa-cog" />
                </button>
              </Dropdown>
            </div>
          </div>
        )}
      </Draggable>
      <Confirm
        visible={confirm}
        close={hideConfirm}
        message={`Are you sure you want to remove the section?`}
        onYes={handleDelete}
        okText="Delete Permanently"
        danger
      />
    </>
  )
}
