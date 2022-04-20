import { AnimatePresence, motion } from 'framer-motion'
import { useRef } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { Controller, useForm } from 'react-hook-form'

import Dropdown from '@utils/components/Dropdown'
import Menu from '@utils/components/Menu'

import { Column } from './Column'
import { TField } from './Field'

const animateVariant = {
  init: { opacity: 0, height: 0, marginTop: 0 },
  animating: { opacity: 1, height: 'auto', marginTop: 8 },
}

interface SectionProps {
  id: string
  name: string
  fieldsColumn1: TField[]
  fieldsColumn2: TField[]
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
  const handleDelete = () => onDelete(id)

  const options = [
    {
      key: 'Delete',
      title: (
        <span className="text-red-500">
          <span className="fa fa-trash mr-2"></span>Delete Permanently
        </span>
      ),
      action: handleDelete,
    },
  ]

  const nameRef = useRef<any>()

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<{ name: string }>({ mode: 'all', defaultValues: { name } })

  const handleRename = handleSubmit((data) => {
    if (data.name !== name) onRename(id, data.name)
    nameRef?.current?.blur && nameRef.current.blur()
  })

  const handleOnBlur = () => {
    if (errors.name) {
      reset({ name })
      return
    }
    handleRename()
  }

  return (
    <Draggable draggableId={id} index={index}>
      {({ draggableProps, innerRef, dragHandleProps }, { isDragging }) => (
        <div
          ref={innerRef}
          {...draggableProps}
          className={`my-4 border border-dashed hover:border-gray-400 rounded-sm p-2 relative ${
            isDragging ? 'border-blue-600 bg-slate-50' : ''
          }`}
        >
          <div className="p-2 !cursor-move flex" {...dragHandleProps}>
            <form onSubmit={handleRename}>
              <Controller
                name="name"
                control={control}
                rules={{
                  maxLength: {
                    value: 100,
                    message: 'Section name length must be at most 100',
                  },
                  required: {
                    value: true,
                    message: 'Section name cannot be empty',
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    onBlur={() => {
                      handleOnBlur()
                    }}
                    ref={nameRef}
                    autoComplete="off"
                    className={`border border-transparent w-[200px] py-1 -ml-2 p-2 rounded-sm outline-none truncate text-gray-700 font-semibold text-[17px] ${
                      errors.name
                        ? '!border-red-600'
                        : 'focus:border-blue-400 hover:border-blue-300'
                    }`}
                  />
                )}
              />

              <AnimatePresence presenceAffectsLayout>
                {errors.name && (
                  <motion.div
                    initial="init"
                    animate="animating"
                    exit="init"
                    variants={animateVariant}
                    className="text-red-600 overflow-hidden -ml-2"
                  >
                    {errors.name.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
          <div className="flex items-stretch">
            <div className="flex-1">
              <Column id={id + SEPERATOR + 1} fields={fieldsColumn1} />
            </div>
            <div className="flex-1">
              <Column id={id + SEPERATOR + 2} fields={fieldsColumn2} />
            </div>
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
  )
}
