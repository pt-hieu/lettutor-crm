import SettingsLayout from '@components/Settings/SettingsLayout'
import Input from '@utils/components/Input'
import { useModal } from '@utils/hooks/useModal'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'
import { notification } from 'antd'
import Loading from '@utils/components/Loading'
import { GetServerSideProps } from 'next'
import { getSessionToken } from '@utils/libs/getToken'
import { getSelf, updateUserInformation } from '@utils/service/user'

type FormData = {
  name: string
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = getSessionToken(req.cookies)
  const client = new QueryClient()

  if (token) {
    await Promise.all([client.prefetchQuery('self-info', getSelf(token))])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default function UpdateInformation() {
  const { data } = useQuery('self-info', getSelf())
  const { email, name, role, status } = data || {}

  const [edit, turnOn, turnOff] = useModal()
  const client = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ defaultValues: { name } })

  const { mutateAsync, isLoading } = useMutation(
    'update-information',
    (data: FormData) => updateUserInformation(data),
    {
      onSuccess(data) {
        notification.success({
          message: 'Update information successfully.',
        })
        turnOff()
        reset({ name: data.name })
        client.invalidateQueries('self-info')
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
          className="grid grid-cols-2 gap-y-2 gap-x-3 w-3/5 mt-3"
        >
          <label
            htmlFor="name"
            className="crm-label text-right font-medium my-[9px]"
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

          <label className="crm-label text-right font-medium my-auto">
            Email
          </label>
          <Input
            showError={false}
            editable={edit}
            props={{
              type: 'text',
              disabled: true,
              value: email,
            }}
          />

          <label className="crm-label text-right font-medium my-auto">
            Role
          </label>
          <Input
            showError={false}
            editable={edit}
            props={{
              type: 'text',
              disabled: true,
              value: role?.join(', '),
              className: 'capitalize',
            }}
          />

          <label className="crm-label text-right font-medium my-auto">
            Status
          </label>
          <Input
            showError={false}
            editable={edit}
            props={{
              type: 'text',
              disabled: true,
              value: status,
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
                  <Loading on={isLoading}>Save</Loading>
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
