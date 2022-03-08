import { useModal } from '@utils/hooks/useModal'
import { Modal, notification } from 'antd'
import { useForm } from 'react-hook-form'
import Input from './Input'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useCallback, useEffect } from 'react'
import { useMutation } from 'react-query'
import { createBug } from '@utils/service/bug'
import Loading from './Loading'
import Tooltip from './Tooltip'

export type BugSubmitPayload = {
  email: string
  subject: string
  description: string
}

const schema = yup.object().shape({
  email: yup
    .string()
    .typeError('Email has to be a string')
    .email('Email is invalid'),
  subject: yup
    .string()
    .typeError('Subject has to be a string')
    .max(100, 'Subject must be at max 100 chars'),
  description: yup
    .string()
    .typeError('Description has to be a string')
    .max(300, 'Description must be at max 300 chars'),
})

export default function BugReporter() {
  const [visible, open, close] = useModal()
  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
  } = useForm<BugSubmitPayload>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (!visible) return
    reset()
  }, [visible])

  const { mutateAsync, isLoading } = useMutation('submit-bug', createBug, {
    onSuccess() {
      notification.success({
        message: 'Submit bug successfully. Thank you!',
      })

      close()
    },
    onError() {
      notification.error({
        message: 'Oops, submitting bug unsuccessfully, please try again',
      })
    },
  })

  const submitBug = useCallback(
    handleSubmit((data) => {
      mutateAsync(data)
    }),
    [],
  )

  return (
    <div className="fixed bottom-5 right-[100px] z-[1000]">
      <Tooltip
        title="Found a bug?"
      >
        <button
          onClick={open}
          className="text-white w-10 h-10 rounded-full bg-blue-600 grid place-content-center"
        >
          <span className="fa fa-bug" />
        </button>
      </Tooltip>

      <Modal
        visible={visible}
        onCancel={isLoading ? undefined : close}
        footer={null}
        centered
      >
        <div className="font-medium text-xl mb-4">
          We are sorry for such inconvience :(
        </div>

        <form noValidate onSubmit={submitBug} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="crm-label after:content-['']">
              Your Email
            </label>
            <Input
              error={errors.email?.message}
              props={{
                type: 'email',
                id: 'email',
                className: 'w-full',
                placeholder: 'So we can contact you for any further discussion',
                ...register('email'),
              }}
            />
          </div>

          <div>
            <label htmlFor="subject" className="crm-label">
              Subject
            </label>
            <Input
              error={errors.subject?.message}
              props={{
                type: 'text',
                id: 'subject',
                className: 'w-full',
                placeholder: 'What do you call this bug?',
                ...register('subject'),
              }}
            />
          </div>

          <div>
            <label htmlFor="desc" className="crm-label">
              Description
            </label>
            <Input
              error={errors.description?.message}
              as="textarea"
              props={{
                id: 'desc',
                className: 'w-full',
                placeholder: 'How to re-produce it?',
                ...register('description'),
              }}
            />
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <button disabled={isLoading} type="submit" className="crm-button">
              <Loading on={isLoading}>Submit</Loading>
            </button>
            <button
              disabled={isLoading}
              onClick={close}
              type="button"
              className="crm-button-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
