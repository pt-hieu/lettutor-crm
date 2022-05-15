import { yupResolver } from '@hookform/resolvers/yup'
import { Divider, Modal, notification } from 'antd'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import * as yup from 'yup'

import Input from '@utils/components/Input'
import Loading from '@utils/components/Loading'
import { Module } from '@utils/models/module'
import { createModule, updateModule } from '@utils/service/module'

type Props = {
  visible: boolean
  close: () => void
  module?: Module
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup
    .string()
    .max(120, 'Description is max 120 characters')
    .optional(),
})

type FormData = Pick<Module, 'name'> & Pick<Partial<Module>, 'description'>

export default function ModuleModal({ close, visible, module }: Props) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const isUpdating = !!module
  const title = isUpdating ? `Update ${module?.name}` : 'Create A New Module'

  useEffect(() => {
    if (!visible) return

    setValue('description', module?.description || '')
    setValue('name', module?.name || '')
  }, [visible])

  useEffect(() => {
    if (visible) return
    reset({ name: '', description: '' })
  }, [visible])

  const client = useQueryClient()

  const updateModuleMutation = useMutation(
    'update-module',
    updateModule(module?.id || ''),
    {
      onSuccess() {
        notification.success({ message: 'Update module successfully' })
        client.refetchQueries('modules')
        close()
      },
      onError() {
        notification.error({ message: 'Update module unsuccesfully' })
      },
    },
  )

  const createModuleMutation = useMutation('create-module', createModule, {
    onSuccess() {
      notification.success({ message: 'Create module successfully' })
      client.refetchQueries('modules')
      close()
    },
    onError() {
      notification.error({ message: 'Create module unsuccesfully' })
    },
  })

  const submit = useCallback(
    handleSubmit(({ name, description }) => {
      description = description || undefined

      if (isUpdating) {
        updateModuleMutation.mutateAsync({ name, description })
        return
      }

      createModuleMutation.mutateAsync({ name, description })
    }),
    [isUpdating, visible],
  )

  return (
    <Modal visible={visible} footer={null} centered onCancel={close}>
      <div className="font-medium text-xl">{title}</div>
      <Divider />

      <form onSubmit={submit}>
        <div className="mb-4">
          <label htmlFor="name" className="crm-label">
            Name
          </label>

          <Input
            error={errors['name']?.message}
            props={{
              id: 'name',
              autoFocus: true,
              type: 'text',
              className: 'w-full',
              ...register('name'),
            }}
          />
        </div>

        <div>
          <label htmlFor="desc" className="crm-label after:contents">
            Description
          </label>

          <Input
            error={errors['description']?.message}
            props={{
              id: 'desc',
              type: 'text',
              className: 'w-full',
              ...register('description'),
            }}
          />
        </div>

        <Divider />

        <div className="flex gap-2 justify-end">
          <button onClick={close} className="crm-button-outline" type="button">
            Cancel
          </button>

          <button
            disabled={
              createModuleMutation.isLoading || updateModuleMutation.isLoading
            }
            className="crm-button"
          >
            <Loading
              on={
                createModuleMutation.isLoading || updateModuleMutation.isLoading
              }
            >
              Submit
            </Loading>
          </button>
        </div>
      </form>
    </Modal>
  )
}
