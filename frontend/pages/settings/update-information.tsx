import SettingsLayout from '@components/Settings/SettingsLayout'
import Input from '@utils/components/Input'
import { useModal } from '@utils/hooks/useModal'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { notification } from 'antd'
import Loading from '@utils/components/Loading'

type FormData = {
  name: string
}

export default function UpdateInformation() {
  const [session] = useTypedSession()
  const { name, email, role } = session?.user || {}
  const [edit, turnOn, turnOff] = useModal()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({ defaultValues: { name } })

  useEffect(() => {
    setValue('name', name || '')
  }, [name])

  useEffect(reset, [edit])

  const { mutateAsync, isLoading } = useMutation(
    'update-information',
    (data: FormData) => Promise.resolve(true),
    {
      onSuccess() {
        notification.success({
          message: 'Update information successfully.',
        })
        turnOff()
      },
      onError() {
        notification.error({
          message: 'Update information unsuccessfully.',
        })
      },
    },
  )

  const updateInformation = useCallback(
    handleSubmit((data) => {
      mutateAsync(data)
    }),
    [],
  )

  return (
    <SettingsLayout title="CRM | Update information">
      <div className="flex gap-3 items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-300" />
        <div>
          <div className="font-semibold">{name}</div>
          <div className="font-semibold">{email}</div>
          <div className="capitalize">{role?.join(', ')}</div>
        </div>
      </div>

      <div>
        <div>
          <h1 className="font-medium text-xl inline">User Information</h1>
          <button className="ml-2" onClick={turnOn} disabled={edit}>
            <span className="fa fa-pen" />
          </button>
        </div>
        <form
          onSubmit={updateInformation}
          className="grid grid-cols-2 gap-2 w-3/5 mt-3"
        >
          <label
            htmlFor="name"
            className="crm-label text-right font-medium my-auto"
          >
            Name
          </label>
          <Input
            error={errors.name?.message}
            editable={edit}
            props={{
              type: 'text',
              ...register('name', {
                required: { value: true, message: 'Name is required' },
              }),
            }}
          />

          <label
            htmlFor="email"
            className="crm-label text-right font-medium my-auto"
          >
            Email
          </label>
          <Input
            error=""
            showError={false}
            editable={edit}
            props={{
              type: 'text',
              disabled: true,
              value: email,
            }}
          />

          <label
            htmlFor="role"
            className="crm-label text-right font-medium my-auto"
          >
            Role
          </label>
          <Input
            error=""
            showError={false}
            editable={edit}
            props={{
              type: 'text',
              disabled: true,
              value: role?.join(', '),
              className: 'capitalize',
            }}
          />

          <AnimatePresence presenceAffectsLayout>
            {edit && (
              <motion.div
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="col-span-2 flex gap-3 justify-center mt-2"
              >
                <button disabled={isLoading} className="crm-button">
                  <Loading on={isLoading}>Submit</Loading>
                </button>
                <button
                  onClick={turnOff}
                  type="button"
                  className="crm-button-outline"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </SettingsLayout>
  )
}
