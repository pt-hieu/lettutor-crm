import { Checkbox } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import React, { ReactNode, useContext, useEffect } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { Controller, useForm } from 'react-hook-form'

import Confirm from '@utils/components/Confirm'
import Dropdown from '@utils/components/Dropdown'
import Input from '@utils/components/Input'
import Menu from '@utils/components/Menu'
import { useModal } from '@utils/hooks/useModal'
import { ActionType } from '@utils/models/customization'
import { FieldMeta, FieldType } from '@utils/models/module'

import { FieldsContext } from './CustomPage'
import { RenameInput } from './RenameInput'

export type TFieldData = Omit<FieldMeta, 'group'> & {
  id: string
  action?: ActionType
  isCustomField?: boolean
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
  [FieldType.CHECK_BOX]: (
    <div>
      <span className="fa fa-check-square mr-1"></span> Check box
    </div>
  ),
}

const firstShowSettingTypes = [FieldType.SELECT, FieldType.RELATION]

export const Field = React.memo(({ data, index, isPure }: FieldProps) => {
  const { id, name, type, required, isCustomField } = data
  const { onDelete, onUpdate, activeField, setActiveField } =
    useContext(FieldsContext)!

  const [confirm, showConfirm, hideConfirm] = useModal()
  const [setting, showSetting, hideSetting] = useModal()

  const handleDelete = () => onDelete(id)

  const handleUpdate = (data: Partial<TFieldData>) => {
    onUpdate(id, data)
  }

  const options = [
    {
      key: 'Mark Required',
      title: (
        <>
          <span
            className={`w-4 fa ${required ? 'fa-close' : 'fa-check'}`}
          ></span>{' '}
          {required ? 'Unmark' : 'Mark'} as required
        </>
      ),
      action: () => handleUpdate({ required: !required }),
    },

    {
      key: 'Edit Properties',
      title: (
        <>
          <span className={`w-4 fa fa-pencil text-[12px]`}></span> Edit
          Properties
        </>
      ),
      action: showSetting,
    },

    {
      key: 'Delete',
      title: (
        <span className="text-red-500">
          <span className="fa fa-trash mr-2"></span>Delete Field
        </span>
      ),
      action: showConfirm,
      disabled: required || !isCustomField,
    },
  ]

  useEffect(() => {
    if (activeField === id) {
      firstShowSettingTypes.includes(type) && showSetting()
      setActiveField(null)
    }
  }, [])

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
    control,
  } = useForm<Partial<FieldMeta>>()

  const submit = handleSubmit((value) => {
    handleUpdate(value)
    hideSetting()
  })

  useEffect(() => {
    reset({ ...data })
  }, [setting])

  return (
    <>
      <Draggable draggableId={id} index={index}>
        {({ dragHandleProps, draggableProps, innerRef }, { isDragging }) => (
          <div
            className={`border rounded-sm p-2 mb-2 bg-white flex justify-between items-center hover:border-orange-300 relative ${
              isPure ? 'opacity-0 !w-[460px] text-gray-500' : ''
            } ${
              isDragging
                ? 'bg-orange-50 border-orange-400 opacity-100'
                : undefined
            }`}
            {...dragHandleProps}
            {...draggableProps}
            ref={innerRef}
          >
            {isPure ? (
              <div className="w-[180px] truncate ml-2">{name}</div>
            ) : (
              <RenameInput
                initialValue={name}
                onRename={(name) => handleUpdate({ name })}
                autoFocus={
                  id === activeField && !firstShowSettingTypes.includes(type)
                }
              />
            )}

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
                    itemClassName="text-left"
                    items={options}
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
            {required && (
              <div className="bg-red-500 w-1 -ml-[2px] rounded-sm absolute top-0 bottom-0 left-0"></div>
            )}
          </div>
        )}
      </Draggable>
      <Confirm
        visible={confirm}
        close={hideConfirm}
        message={`Are you sure you want to remove the field?`}
        onYes={handleDelete}
        okText="Delete Permanently"
        danger
      />

      <Modal
        visible={setting}
        title={`${name} Properties`}
        onCancel={hideSetting}
        destroyOnClose
        footer={
          <div className="flex w-full gap-2 justify-end">
            <button onClick={submit} className="crm-button">
              Submit
            </button>
            <button onClick={hideSetting} className="crm-button-outline">
              Cancel
            </button>
          </div>
        }
      >
        <div className="max-h-[400px] overflow-y-auto overflow-x-hidden crm-scrollbar pr-2">
          <form className="rounded-md p-4" onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <label htmlFor="name" className="crm-label">
                Field label
              </label>
              <Input
                error={errors.name?.message}
                props={{
                  type: 'text',
                  id: 'name',
                  className: 'w-full',
                  ...register('name', {
                    maxLength: {
                      value: 100,
                      message: 'Name length must be at most 100',
                    },
                    required: {
                      value: true,
                      message: 'Name cannot be empty',
                    },
                  }),
                }}
              />
            </div>

            {[
              FieldType.TEXT,
              FieldType.MULTILINE_TEXT,
              FieldType.PHONE,
            ].includes(type) && (
              <div className="mb-4">
                <label htmlFor="maxLength" className="crm-label">
                  Number of characters allowed
                </label>
                <Input
                  error={errors.maxLength?.message}
                  props={{
                    type: 'number',
                    id: 'maxLength',
                    className: 'w-full',
                    ...register('maxLength', {
                      required: {
                        value: true,
                        message: 'Max length is required',
                      },
                    }),
                  }}
                />
              </div>
            )}

            {type === FieldType.NUMBER && (
              <div className="mb-4">
                <label htmlFor="max" className="crm-label">
                  Maximum digits allowed
                </label>
                <Input
                  error={errors.max?.message}
                  props={{
                    type: 'number',
                    id: 'max',
                    className: 'w-full',
                    ...register('max', {
                      required: {
                        value: true,
                        message: 'Maximum degits is required',
                      },
                      min: {
                        value: 2,
                        message: 'Maximum degits must not be less than 2',
                      },
                      max: {
                        value: 16,
                        message: 'Maximum degits must be at most 16',
                      },
                    }),
                  }}
                />
              </div>
            )}

            {type !== FieldType.CHECK_BOX && (
              <div className="mb-4">
                <Controller
                  control={control}
                  name="required"
                  render={({ field: { onChange, value, ref } }) => (
                    <Checkbox onChange={onChange} checked={value} ref={ref}>
                      Required
                    </Checkbox>
                  )}
                />
              </div>
            )}
          </form>
        </div>
      </Modal>
    </>
  )
})
