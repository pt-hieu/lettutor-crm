import { AnimatePresence, motion } from 'framer-motion'
import React, { useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'

type Props = {
  initialValue: string
  onRename: (name: string) => void
  className?: string
}

const animateVariant = {
  init: { opacity: 0, height: 0, marginTop: 0 },
  animating: { opacity: 1, height: 'auto', marginTop: 8 },
}

export const RenameInput = ({ initialValue, onRename, className }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<{ name: string }>({
    mode: 'all',
    defaultValues: { name: initialValue },
  })

  const nameRef = useRef<any>()

  const handleRename = handleSubmit(({ name }) => {
    if (name !== initialValue) onRename(name)
    nameRef?.current?.blur && nameRef.current.blur()
  })

  const handleOnBlur = () => {
    if (errors.name) {
      reset({ name: initialValue })
      return
    }
    handleRename()
  }
  return (
    <form onSubmit={handleRename}>
      <Controller
        name="name"
        control={control}
        rules={{
          maxLength: {
            value: 100,
            message: 'Name length must be at most 100',
          },
          required: {
            value: true,
            message: 'Name cannot be empty',
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
            className={`border border-transparent w-[200px] py-1 p-2 rounded-sm outline-none truncate ${
              errors.name
                ? '!border-red-600'
                : 'focus:border-blue-400 hover:border-blue-300'
            } ${className ? className : ''}`}
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
            className="text-red-600 overflow-hidden"
          >
            {errors.name.message}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}
