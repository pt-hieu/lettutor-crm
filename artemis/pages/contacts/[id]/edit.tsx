import { yupResolver } from '@hookform/resolvers/yup'
import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import { phoneRegExp } from '@utils/data/regex'
import { ContactUpdateData } from '@utils/data/update-contact-data'
import { Field } from '@utils/data/update-lead-data'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { User } from '@utils/models/user'
import { getAccounts } from '@utils/service/account'
import { getContact, updateContact } from '@utils/service/contact'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { dehydrate, QueryClient, useMutation, useQuery } from 'react-query'
import * as yup from 'yup'
import { ContactAddFormData } from '../add-contact'

export const editContactSchema = yup.object().shape({
  ownerId: yup.string().required('Contact Owner is required.'),
  email: yup
    .string()
    .email('Please enter a valid email address.')
    .max(100, 'Email must be at most 100 characters.')
    .required('Email is required.'),
  phoneNum: yup
    .string()
    .required('Phone is required.')
    .matches(phoneRegExp, 'Phone is invalid.'),
  fullName: yup
    .string()
    .required('Full Name is required.')
    .max(100, 'Full Name must be at most 100 characters.'),
  source: yup.string().required('Lead Source is required.'),
  description: yup
    .string()
    .max(500, 'Description must be at most 500 characters.'),
  address: yup.string().max(100, 'Address must be at most 250 characters.'),
})

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

  const { isLoading, mutateAsync } = useMutation(
    'update-contact',
    updateContact,
    {
      onSuccess: () => {
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
  } = useForm<ContactAddFormData>({
    mode: 'all',
    resolver: yupResolver(editContactSchema),
    defaultValues: {
      ownerId: contact?.owner?.id,
      fullName: contact?.fullName,
      email: contact?.email,
      source: contact?.source,
      address: contact?.address,
      description: contact?.description,
      phoneNum: contact?.phoneNum,
      accountId: contact?.account?.id || 'None',
    },
  })

  const editContact = handleSubmit((data) => {
    if (data.accountId === 'None') {
      data.accountId = null
    }
    mutateAsync({ id, contactInfo: data })
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
                    <option key="none" value="None">
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
    notFound: investigate(client, ['users'], ['accounts'], ['contact', id])
      .isError,
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default UpdateContact
