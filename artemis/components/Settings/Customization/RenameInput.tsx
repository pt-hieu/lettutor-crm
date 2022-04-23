import { yupResolver } from '@hookform/resolvers/yup'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'

const nameSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .max(100, 'Name must be at most 100 characters.'),
})

type Props = {
  initialValue: string
  onRename: (name: string) => void | boolean
  className?: string
  autoFocus?: boolean
}

const animateVariant = {
  init: { opacity: 0, height: 0, marginTop: 0 },
  animating: { opacity: 1, height: 'auto', marginTop: 8 },
}

export const RenameInput = ({
  initialValue,
  onRename,
  className,
  autoFocus,
}: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
  } = useForm<{ name: string }>({
    mode: 'all',
    defaultValues: { name: initialValue },
    resolver: yupResolver(nameSchema),
  })

  useEffect(() => {
    reset({ name: initialValue })
  }, [initialValue])

  const nameRef = useRef<any>()

  const handleRename = handleSubmit(({ name }) => {
    if (name.trim() !== initialValue) {
      const result = onRename(name)
      if (result === false) {
        setError('name', { message: 'Name is exist' })
        return
      }
    }
    reset({ name: initialValue })
    nameRef?.current?.blur && nameRef.current.blur()
  })

  const handleOnBlur = () => {
    if (errors.name) {
      reset({ name: initialValue })
      return
    }
    handleRename()
  }

  useEffect(() => {
    if (autoFocus) {
      nameRef?.current?.focus && nameRef.current.focus()
    }
  }, [])

  return (
    <form onSubmit={handleRename}>
      <Controller
        name="name"
        control={control}
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
