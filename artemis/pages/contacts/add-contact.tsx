import { yupResolver } from '@hookform/resolvers/yup'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { QueryClient, dehydrate, useMutation, useQuery } from 'react-query'

import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import { ContactUpdateData } from '@utils/data/update-contact-data'
import { Field } from '@utils/data/update-lead-data'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { LeadSource } from '@utils/models/lead'
import { Actions } from '@utils/models/role'
import { User } from '@utils/models/user'
import { getRawAccounts } from '@utils/service/account'
import { addContact } from '@utils/service/contact'
import { getRawUsers } from '@utils/service/user'

import { editContactSchema } from './[id]/edit'

export interface ContactAddFormData
  extends Pick<
    Contact,
    'fullName' | 'email' | 'source' | 'description' | 'phoneNum' | 'address'
  > {
  ownerId: string
  accountId: string | null
}

const CreateContact = () => {
  const [session] = useTypedSession()
  const { push } = useRouter()

  const { data: contactOwners } = useQuery<User[]>(['users'], {
    enabled: false,
  })

  const { data: accounts } = useQuery<Account[]>(['accounts'], {
    enabled: false,
  })

  const { isLoading, mutateAsync } = useMutation('add-contact', addContact, {
    onSuccess: (res) => {
      notification.success({
        message: 'Add contact successfully.',
      })
      push(`/contacts/${res.id}`)
    },
    onError: () => {
      notification.error({ message: 'Add contact unsuccessfully.' })
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContactAddFormData>({
    resolver: yupResolver(editContactSchema),
    defaultValues: {
      ownerId: '',
      fullName: '',
      email: '',
      source: LeadSource.NONE,
      address: '',
      description: '',
      phoneNum: '',
      accountId: undefined,
    },
  })

  useEffect(() => {
    setValue('ownerId', session?.user.id || '')
  }, [session?.user.id])

  const handleAddContact = handleSubmit((data) => {
    if (data.accountId === 'None') {
      data.accountId = null
    }
    mutateAsync(data)
  })

  const renderField = ({
    label,
    name,
    as,
    selectSource,
    type,
    required,
  }: Field) => (
    <div key={name} className="grid grid-cols-3 mb-6 gap-6">
      <label
        htmlFor={name}
        className={`mt-[10px] crm-label text-right ${
          required ? '' : "after:content-['']"
        }`}
      >
        {label}
      </label>
      <div className="col-span-2">
        {/* @ts-ignore */}
        <Input
          error={errors[name as keyof ContactAddFormData]?.message}
          as={as!}
          props={{
            id: name,
            type: type || 'text',
            className: `text-sm p-3 min-h-[44px] ${
              name === 'description' || name === 'address'
                ? 'w-[600px]'
                : 'w-full'
            }`,
            children:
              as === 'select' ? (
                name === 'ownerId' ? (
                  <>
                    {contactOwners?.map(({ id, name }) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </>
                ) : name === 'accountId' ? (
                  <>
                    <option key="none" value={'None'}>
                      None
                    </option>
                    {accounts?.map(({ id, fullName }) => (
                      <option key={id} value={id}>
                        {fullName}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    {selectSource?.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </>
                )
              ) : undefined,
            ...register(name as keyof ContactAddFormData),
          }}
        />
      </div>
    </div>
  )

  return (
    <Layout requireLogin title="CRM | Add contact">
      <form
        noValidate
        onSubmit={handleAddContact}
        className="crm-container grid grid-cols-[1fr,180px] gap-4 pt-6"
      >
        <div>
          {ContactUpdateData.map(({ title, items }) => (
            <div className="flex flex-col gap-6" key={title}>
              <h1 className="font-semibold text-lg text-gray-700">{title}</h1>

              <div className="grid grid-cols-2 gap-4">
                {items.map((field) => renderField(field))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end sticky top-[72px] gap-3 max-h-[40px]">
          <button
            type="button"
            className="crm-button-outline"
            onClick={() => push(`/contacts`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="crm-button"
            onClick={handleAddContact}
            disabled={isLoading}
          >
            Save
          </button>
        </div>
      </form>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  if (token) {
    await Promise.all([
      client.prefetchQuery(['users'], getRawUsers(token)),
      client.prefetchQuery(['accounts'], getRawAccounts(token)),
    ])
  }

  return {
    notFound: await checkActionError(req, Actions.Contact.CREATE_NEW_CONTACT),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default CreateContact
