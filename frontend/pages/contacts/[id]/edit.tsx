import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import { Field } from '@utils/data/add-lead-data'
import { ContactUpdateData } from '@utils/data/update-contact-data'
import { getSessionToken } from '@utils/libs/getToken'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { User } from '@utils/models/user'
import { getAccounts } from '@utils/service/account'
import { getContact, updateContact } from '@utils/service/contact'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { validate } from 'pages/leads/add-lead'
import { useForm } from 'react-hook-form'
import { dehydrate, QueryClient, useMutation, useQuery } from 'react-query'

export interface ContactUpdateFormData
  extends Pick<
    Contact,
    | 'fullName'
    | 'email'
    | 'status'
    | 'source'
    | 'description'
    | 'phoneNum'
    | 'address'
  > {
  ownerId: string
  accountId: string
}

const UpdateContact = () => {
  const { push, query } = useRouter()
  const id = query.id as string

  const { data: contactOwners } = useQuery<User[]>(['users'], {
    enabled: false,
  })

  const { data: accounts } = useQuery<Account[]>(['accounts'], {
    enabled: false,
  })

  const { data: contact } = useQuery<Contact>(['contact', id], {
    enabled: false,
  })

  console.log('contact', contact)

  const { isLoading, mutateAsync } = useMutation(
    'update-contact',
    updateContact,
    {
      onSuccess: (res) => {
        console.log('res', res)
        notification.success({
          message: 'Edit contact successfully.',
        })
        push(`/contacts/${id}`)
      },
      onError: () => {
        notification.error({ message: 'Edit contact unsuccessfully.' })
      },
    },
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactUpdateFormData>({
    mode: 'all',
    defaultValues: {
      ownerId: contact?.owner.id,
      fullName: contact?.fullName,
      email: contact?.email,
      status: contact?.status,
      source: contact?.source,
      address: contact?.address,
      description: contact?.description,
      phoneNum: contact?.phoneNum,
      accountId: contact?.account?.id,
    },
  })

  const editContact = handleSubmit((data) => {
    mutateAsync({ id, contactInfo: data })
  })

  const renderField = ({
    id,
    name,
    as,
    selectSource,
    type,
    validation,
  }: Field) => (
    <div key={id} className="grid grid-cols-3 mb-6 gap-6">
      <label
        htmlFor={id}
        className={`mt-[10px] crm-label text-right ${
          validation?.required ? '' : "after:content-['']"
        }`}
      >
        {name}
      </label>
      <div className="col-span-2">
        {/* @ts-ignore */}
        <Input
          error={errors[id as keyof ContactUpdateFormData]?.message}
          as={as!}
          props={{
            type: type,
            className: `text-sm p-3 min-h-[44px] ${
              id === 'description' || id === 'address' ? 'w-[600px]' : 'w-full'
            }`,
            children:
              as === 'select' ? (
                id === 'ownerId' ? (
                  <>
                    {contactOwners?.map(({ id, name }) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </>
                ) : id === 'accountId' ? (
                  <>
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
            ...register(
              id as keyof ContactUpdateFormData,
              validation
                ? validate({
                    id,
                    name,
                    as,
                    selectSource,
                    validation,
                    type,
                  })
                : undefined,
            ),
          }}
        />
      </div>
    </div>
  )

  return (
    <Layout requireLogin title="CRM | Edit contact">
      <div className="crm-container grid grid-cols-[1fr,180px] gap-4 pt-6">
        <div>
          {/* Lead Infomation Start */}
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
            className="crm-button-outline"
            onClick={() => push(`/contacts/${id}`)}
          >
            Cancel
          </button>
          <button
            className="crm-button"
            onClick={editContact}
            disabled={isLoading}
          >
            Save
          </button>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const client = new QueryClient()
  const id = params?.id as string
  const token = getSessionToken(req.cookies)

  if (token) {
    await Promise.all([
      client.prefetchQuery(
        ['users'],
        getUsers(
          {
            shouldNotPaginate: true,
          },
          token,
        ),
      ),
      client.prefetchQuery(
        ['accounts'],
        getAccounts({ shouldNotPaginate: true }, token),
      ),
      client.prefetchQuery(['contact', id], getContact(id, token)),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default UpdateContact
