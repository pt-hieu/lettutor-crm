import { yupResolver } from '@hookform/resolvers/yup'
import { Divider, Modal, notification } from 'antd'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'

import { Attachments } from '@utils/models/note'
import { updateAttachmentAsLink } from '@utils/service/attachment'

import { attachmentSchema } from './AttachmentSection'
import Input from './Input'
import Loading from './Loading'

type TProps = {
  visible: boolean
  data?: Attachments
  close: () => void
  onRefetch: () => void
}

type TFormData = {} & Pick<Attachments, 'key' | 'location'>

export default function UpdateLinkAttachmentModal({
  close,
  visible,
  data,
  onRefetch: refetch,
}: TProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TFormData>({
    resolver: yupResolver(attachmentSchema),
    defaultValues: {
      key: data?.key,
      location: data?.location,
    },
  })

  useEffect(() => {
    if (!data) return
    reset({
      key: data?.key,
      location: data?.location,
    })
  }, [data])

  const { isLoading, mutateAsync } = useMutation(
    ['upate-attachment', data?.id],
    updateAttachmentAsLink(data?.id || ''),
    {
      onSuccess() {
        refetch()
        notification.success({ message: 'Update attachment successfully' })
        close()
      },
      onError() {
        notification.error({ message: 'Update attachment unsuccessfully' })
      },
    },
  )

  const submitData = useCallback(
    handleSubmit((data) => {
      mutateAsync(data)
    }),
    [],
  )

  return (
    <Modal onCancel={close} visible={visible} centered footer={null}>
      <div className="font-medium text-xl">Update Attachment</div>
      <Divider />

      <form noValidate onSubmit={submitData}>
        <div className="mb-4">
          <label htmlFor="name" className="crm-label">
            Name
          </label>
          <Input
            error={errors.key?.message}
            props={{
              type: 'text',
              id: 'name',
              className: 'w-full',
              ...register('key'),
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="link" className="crm-label">
            Link
          </label>
          <Input
            error={errors.location?.message}
            props={{
              type: 'text',
              id: 'link',
              className: 'w-full',
              ...register('location'),
            }}
          />
        </div>
      </form>

      <div className="flex flex-col items-center">
        <div className="mt-4 flex gap-2 self-end">
          <button onClick={close} className="crm-button-outline">
            Cancel
          </button>

          <button
            onClick={submitData}
            disabled={isLoading}
            className="crm-button"
          >
            <Loading on={isLoading}>
              <span className="fa fa-upload mr-2" />
              Upload
            </Loading>
          </button>
        </div>
      </div>
    </Modal>
  )
}
