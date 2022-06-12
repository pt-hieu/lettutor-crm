import { yupResolver } from '@hookform/resolvers/yup'
import { Divider, Modal } from 'antd'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

import Input from '@utils/components/Input'
import { useDispatch } from '@utils/hooks/useDispatch'

type Props = {
  visible: boolean
  close: () => void
  name?: string
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
})

export default function GroupModal({ close, visible, name }: Props) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<{ name: string }>({
    resolver: yupResolver(schema),
  })

  const isUpdating = !!name
  const title = isUpdating ? `Update ${name}` : 'Create A New Group'

  useEffect(() => {
    if (!visible) return
    setValue('name', name || '')
  }, [visible])

  const dispatch = useDispatch()
  const submit = useCallback(
    handleSubmit(({ name: newName }) => {
      if (isUpdating) {
        dispatch('cmd:update-group', { name, newName, time: Date.now() })
        close()
        return
      }

      dispatch('cmd:create-group', newName)
      close()
    }),
    [isUpdating, visible],
  )

  return (
    <Modal visible={visible} footer={null} centered onCancel={close}>
      <div className="font-medium text-xl">{title}</div>
      <Divider />

      <form onSubmit={submit}>
        <div>
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

        <Divider />

        <div className="flex gap-2 justify-end">
          <button onClick={close} className="crm-button-outline" type="button">
            Cancel
          </button>

          <button className="crm-button">Submit</button>
        </div>
      </form>
    </Modal>
  )
}
