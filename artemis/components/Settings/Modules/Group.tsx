import { useEffect, useState } from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import { FormProvider, useForm } from 'react-hook-form'

import Confirm from '@utils/components/Confirm'
import { useDispatch } from '@utils/hooks/useDispatch'
import { FieldMeta, FieldType } from '@utils/models/module'

import { FieldPresentation } from './FieldPresentation'

type Props = {
  name: string | undefined
  data: FieldMeta[]
  includeName: boolean
  onEditField: (name: string) => void
  onRemoveField: (name: string) => void
  onEditGroup: (name: string) => void
}

export default function Group({
  name = '',
  data,
  includeName,
  onEditField: editField,
  onRemoveField: removeField,
  onEditGroup: editGroup,
}: Props) {
  const [fields, setFields] = useState(data)
  const form = useForm()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!includeName) {
      setFields(data)
      return
    }

    setFields([
      {
        name: 'name',
        group: name,
        required: true,
        visibility: { Overview: true, Update: true },
        type: FieldType.TEXT,
        maxLength: 30,
      },
      ...data,
    ])
  }, [data])

  return (
    <div>
      <div className="mb-4 group flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className="font-medium text-lg">{name}</div>

          <button
            onClick={() => editGroup(name)}
            className="fa fa-edit w-8 aspect-square opacity-0 rounded-full group-hover:opacity-100 hover:bg-gray-300"
          />

          <Confirm
            message="Are you sure you want to delete this group and all of its descendant fields?"
            onYes={() => dispatch('cmd:delete-group', { name })}
          >
            <button className="fa fa-trash w-8 aspect-square opacity-0 rounded-full group-hover:opacity-100 hover:bg-gray-300" />
          </Confirm>
        </div>

        <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() =>
              dispatch('cmd:change-group-order', { name, type: 'up' })
            }
            className="fa fa-caret-up w-8 aspect-square  hover:bg-gray-300 pt-1 rounded-full"
          />
          <button
            onClick={() =>
              dispatch('cmd:change-group-order', { name, type: 'down' })
            }
            className="fa fa-caret-down w-8 aspect-square hover:bg-gray-300 rounded-full"
          />
        </div>
      </div>

      <Droppable droppableId={name}>
        {({ droppableProps, innerRef, placeholder }, { isDraggingOver }) => (
          <div
            className={`${
              fields.length ? '' : 'min-h-[150px]'
            } crm-transition border border-dashed rounded-md p-4 grid grid-cols-2 gap-x-2 gap-y-4 ${
              isDraggingOver ? 'border-blue-600' : ''
            }`}
            ref={innerRef}
            {...droppableProps}
          >
            <FormProvider {...form}>
              {fields.map((field, index) => (
                <Draggable
                  key={field.name}
                  draggableId={field.name}
                  index={index}
                  isDragDisabled={field.name === 'name'}
                >
                  {({ draggableProps, innerRef, dragHandleProps }) => (
                    <div
                      className="flex gap-2 items-start group "
                      ref={innerRef}
                      {...draggableProps}
                    >
                      <span
                        className="w-8 aspect-square hover:bg-gray-300 grid place-content-center rounded-full fa fa-bars ml-2 mt-[5px]"
                        {...dragHandleProps}
                      />

                      <FieldPresentation field={field} />

                      {field.name !== 'name' && (
                        <div className="flex gap-2 group-hover:opacity-100 opacity-0">
                          <button
                            onClick={() => editField(field.name)}
                            className="fa fa-edit mt-[5px] ml-2  w-8 aspect-square hover:bg-gray-300 rounded-full crm-transition"
                          />

                          <Confirm
                            message="Are you sure you want to delete this field?"
                            onYes={() => removeField(field.name)}
                          >
                            <button className="fa fa-trash mt-[5px] ml-2  w-8 aspect-square hover:bg-gray-300 rounded-full crm-transition" />
                          </Confirm>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
            </FormProvider>
            {placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
