import ContactDetailNavbar from '@components/Contacts/ContactDetailNavbar'
import ContactDetailSidebar, {
  ContactDetailSections,
} from '@components/Contacts/ContactDetailSidebar'
import { yupResolver } from '@hookform/resolvers/yup'
import DealInfo from '@utils/components/DealInfo'
import InlineEdit from '@utils/components/InlineEdit'
import { Props } from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import TaskList from '@utils/components/TaskList'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { LeadSource } from '@utils/models/lead'
import { TaskStatus } from '@utils/models/task'
import { User } from '@utils/models/user'
import { getAccounts } from '@utils/service/account'
import { getContact, updateContact } from '@utils/service/contact'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo } from 'react'
import { FieldErrors, useForm, UseFormRegister } from 'react-hook-form'
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'
import { ContactAddFormData } from '../add-contact'
import { editContactSchema } from './edit'

type ContactInfo = {
  label: string
  props: Omit<Props<'input' | 'textarea' | 'select' | undefined>, 'editable'>
}

const fields = (
  register: UseFormRegister<ContactAddFormData>,
  errors: FieldErrors<ContactAddFormData>,
  users: User[],
  accounts: Account[],
): Array<ContactInfo> => [
  {
    label: 'Contact Owner',
    props: {
      as: 'select',
      error: errors.ownerId?.message,
      props: {
        children: (
          <>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </>
        ),
        id: 'contact-owner',
        ...register('ownerId'),
      },
    },
  },
  {
    label: 'Full Name',
    props: {
      error: errors.fullName?.message,
      props: {
        type: 'text',
        id: 'full-name',
        ...register('fullName'),
      },
    },
  },
  {
    label: 'Email',
    props: {
      error: errors.email?.message,
      props: {
        type: 'email',
        id: 'email',
        ...register('email'),
      },
    },
  },
  {
    label: 'Phone',
    props: {
      error: errors.phoneNum?.message,
      props: {
        type: 'text',
        id: 'phone',
        ...register('phoneNum'),
      },
    },
  },
  {
    label: 'Lead Source',
    props: {
      error: errors.source?.message,
      as: 'select',
      props: {
        id: 'source',
        children: (
          <>
            {Object.values(LeadSource).map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </>
        ),
        ...register('source'),
      },
    },
  },
  {
    label: 'Account',
    props: {
      as: 'select',
      error: errors.accountId?.message,
      props: {
        children: (
          <>
            <option key="none" value={'None'}>
              None
            </option>
            {accounts.map(({ id, fullName }) => (
              <option key={id} value={id}>
                {fullName}
              </option>
            ))}
          </>
        ),
        id: 'account',
        ...register('accountId'),
      },
    },
  },
  {
    label: 'Address',
    props: {
      error: errors.address?.message,
      props: {
        type: 'text',
        id: 'address',
        ...register('address'),
      },
    },
  },
  {
    label: 'Description',
    props: {
      error: errors.description?.message,
      props: {
        type: 'text',
        id: 'desc',
        ...register('description'),
      },
    },
  },
]

const ContactDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  const client = useQueryClient()
  const { data: users } = useQuery<User[]>('users', { enabled: false })
  const { data: contact } = useQuery<Contact>(['contact', id], getContact(id))
  const { data: accounts } = useQuery<Account[]>(['accounts'], {
    enabled: false,
  })

  const defaultValues = useMemo(
    () => ({
      ownerId: contact?.owner?.id,
      fullName: contact?.fullName,
      email: contact?.email,
      source: contact?.source || LeadSource.NONE,
      address: contact?.address || '',
      description: contact?.description || '',
      phoneNum: contact?.phoneNum || '',
      accountId: contact?.account?.id || 'None',
    }),
    [contact],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactAddFormData>({
    mode: 'onChange',
    resolver: yupResolver(editContactSchema),
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues])

  const { mutateAsync } = useMutation(['update-contact', id], updateContact, {
    onSuccess() {
      notification.success({ message: 'Update contact successfully' })
      client.invalidateQueries(['contact', id])
    },
    onError() {
      notification.error({ message: 'Update contact unsuccessfully' })
    },
  })

  const submit = useCallback(
    handleSubmit((data) => {
      if (data.accountId === 'None') {
        data.accountId = null
      }
      mutateAsync({ contactInfo: data, id })
    }),
    [id],
  )

  const openTasks = useMemo(
    () =>
      contact?.tasks?.filter((task) => task.status !== TaskStatus.COMPLETED),
    [contact],
  )
  const closedTasks = useMemo(
    () =>
      contact?.tasks?.filter((task) => task.status === TaskStatus.COMPLETED),
    [contact],
  )

  return (
    <Layout title={`CRM | Contact | ${contact?.fullName}`} requireLogin>
      <div className="crm-container">
        <ContactDetailNavbar data={contact} />

        <div className="grid grid-cols-[250px,1fr]">
          <ContactDetailSidebar />

          <div className="flex flex-col divide-y gap-4">
            <div>
              <div className="font-semibold mb-4 text-[17px]">Overview</div>
              <form onSubmit={submit} className="flex flex-col gap-2">
                {fields(register, errors, users || [], accounts || []).map(
                  ({ label, props }) => (
                    <div
                      key={label}
                      className="grid grid-cols-[250px,350px] gap-4"
                    >
                      <span className="inline-block text-right font-medium pt-[8px]">
                        {label}
                      </span>
                      <InlineEdit
                        onEditCancel={() => reset(defaultValues)}
                        onEditComplete={submit}
                        {...props}
                      />
                    </div>
                  ),
                )}
              </form>
            </div>
            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={ContactDetailSections.Deals}
              >
                {ContactDetailSections.Deals}
              </div>
              {contact?.deals?.map(
                ({ id, fullName, amount, stage, closingDate }) => (
                  <DealInfo
                    key={id}
                    id={id}
                    fullName={fullName}
                    amount={amount}
                    stage={stage}
                    closingDate={closingDate}
                  />
                ),
              )}
            </div>
            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={ContactDetailSections.OpenActivities}
              >
                {ContactDetailSections.OpenActivities}
              </div>
              {openTasks && openTasks.length > 0 ? (
                <TaskList tasks={openTasks} />
              ) : (
                <p className="text-gray-500 font-medium">No records found</p>
              )}
            </div>
            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={ContactDetailSections.ClosedActivities}
              >
                {ContactDetailSections.ClosedActivities}
              </div>
              {closedTasks && closedTasks.length > 0 ? (
                <TaskList tasks={closedTasks} />
              ) : (
                <p className="text-gray-500 font-medium">No records found</p>
              )}
            </div>
          </div>
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
  const token = getSessionToken(req.cookies)
  const id = params?.id as string

  if (token) {
    await Promise.all([
      client.prefetchQuery(['contact', id], getContact(id, token)),
      client.prefetchQuery(
        'users',
        getUsers({ shouldNotPaginate: true }, token),
      ),
      client.prefetchQuery(
        'accounts',
        getAccounts({ shouldNotPaginate: true }, token),
      ),
    ])
  }

  return {
    notFound: investigate(client, ['contact', id], 'users', 'accounts').isError,
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default ContactDetail
