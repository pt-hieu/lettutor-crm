import { yupResolver } from '@hookform/resolvers/yup'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldErrors, UseFormRegister, useForm } from 'react-hook-form'
import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'

import ContactDetailNavbar from '@components/Contacts/ContactDetailNavbar'
import ContactDetailSidebar, {
  ContactDetailSections,
} from '@components/Contacts/ContactDetailSidebar'
import LogSection from '@components/Logs/LogSection'
import { INoteData } from '@components/Notes/NoteAdder'
import { DEFAULT_NUM_NOTE, NoteSection } from '@components/Notes/NoteSection'

import DealInfo from '@utils/components/DealInfo'
import InlineEdit from '@utils/components/InlineEdit'
import { Props } from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import TaskList from '@utils/components/TaskList'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useOwnership, useServerSideOwnership } from '@utils/hooks/useOwnership'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { LeadSource } from '@utils/models/lead'
import { LogSource } from '@utils/models/log'
import { AddNoteDto } from '@utils/models/note'
import { Actions } from '@utils/models/role'
import { TaskStatus } from '@utils/models/task'
import { User } from '@utils/models/user'
import { getRawAccounts } from '@utils/service/account'
import { getContact, updateContact } from '@utils/service/contact'
import {
  SortNoteType,
  addNote,
  deleteNote,
  editNote,
  getNotes,
} from '@utils/service/note'
import { getRawUsers } from '@utils/service/user'

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
  disabled?: boolean,
): Array<ContactInfo> => [
  {
    label: 'Contact Owner',
    props: {
      as: 'select',
      error: errors.ownerId?.message,
      props: {
        disabled,
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
        disabled,
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
        disabled,
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
        disabled,
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
        disabled,
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
        disabled,
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
        disabled,
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
      as: 'textarea',
      props: {
        disabled,
        id: 'desc',
        ...register('description'),
        cols: 40,
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

  const [sortNote, setSortNote] = useState<SortNoteType>('first')
  const [viewAllNote, setViewAllNote] = useState(false)

  const { data: notes } = useQuery<any>(
    ['contact', id, 'notes', sortNote, viewAllNote],
    getNotes({
      source: 'contact',
      sourceId: id,
      sort: sortNote,
      shouldNotPaginate: viewAllNote,
      nTopRecent: viewAllNote ? undefined : DEFAULT_NUM_NOTE,
    }),
  )

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
      client.refetchQueries([id, 'detail-log'])
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

  const auth = useAuthorization()
  const isOwner = useOwnership(contact)

  const [session] = useTypedSession()

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

  const { mutateAsync: addNoteService } = useMutation(
    'add-note-contact',
    addNote,
    {
      onSuccess() {
        client.invalidateQueries(['contact', id, 'notes'])
        client.invalidateQueries([id, 'detail-log'])
      },
      onError() {
        notification.error({ message: 'Add note unsuccessfully' })
      },
    },
  )

  const handleAddNote = (data: INoteData) => {
    const dataInfo: AddNoteDto = {
      ownerId: session?.user.id as string,
      contactId: contact?.id,
      source: 'contact',
      ...data,
    }
    addNoteService(dataInfo)
  }

  const { mutateAsync: editNoteService } = useMutation(
    'edit-note-contact',
    editNote,
    {
      onSuccess() {
        client.invalidateQueries(['contact', id, 'notes'])
        notification.success({ message: 'Edit note successfully' })
      },
      onError() {
        notification.error({ message: 'Edit note unsuccessfully' })
      },
    },
  )
  const handleEditNote = (noteId: string, data: INoteData) => {
    editNoteService({ noteId, dataInfo: data })
  }

  const { mutateAsync: deleteNoteService } = useMutation(
    'delete-note-contact',
    deleteNote,
    {
      onSuccess() {
        client.invalidateQueries(['contact', id, 'notes'])
        notification.success({ message: 'Delete note successfully' })
      },
      onError() {
        notification.error({ message: 'Delete note unsuccessfully' })
      },
    },
  )

  const handleDeleteNote = (noteId: string) => {
    deleteNoteService({ noteId })
  }

  const handleChangeFilterSort = ({ sort }: { sort: SortNoteType }) => {
    setSortNote(sort)
  }

  return (
    <Layout title={`CRM | Contact | ${contact?.fullName}`} requireLogin>
      <div className="crm-container">
        <ContactDetailNavbar data={contact} />

        <div className="grid grid-cols-[250px,1fr]">
          <ContactDetailSidebar />

          <div className="flex flex-col gap-4 ml-5">
            <div>
              <div className="font-semibold mb-4 text-[17px]">Overview</div>
              <form onSubmit={submit} className="flex flex-col gap-2">
                {fields(
                  register,
                  errors,
                  users || [],
                  accounts || [],
                  !auth[Actions.Contact.VIEW_AND_EDIT_ALL_CONTACT_DETAILS] &&
                    !isOwner,
                ).map(({ label, props }) => (
                  <div
                    key={label}
                    className="grid grid-cols-[250px,350px] gap-4"
                  >
                    <span className="inline-block text-right font-medium pt-[10px]">
                      {label}
                    </span>
                    <InlineEdit
                      onEditCancel={() => reset(defaultValues)}
                      onEditComplete={submit}
                      {...props}
                    />
                  </div>
                ))}
              </form>
            </div>

            <NoteSection
              noteFor="contact"
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              notes={viewAllNote ? notes || [] : notes?.items || []}
              totalNotes={notes?.meta?.totalItems || 0}
              onDeleteNote={handleDeleteNote}
              onChangeFilterSort={handleChangeFilterSort}
              onViewAllNote={setViewAllNote}
            />

            <div className="p-4 border rounded-md">
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

            <LogSection
              source={LogSource.CONTACT}
              entityId={id}
              title={ContactDetailSections.Logs}
            />

            <div className="p-4 rounded-md border">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={ContactDetailSections.OpenActivities}
              >
                {ContactDetailSections.OpenActivities}
              </div>
              {openTasks && openTasks.length > 0 ? (
                <TaskList source="contact" tasks={openTasks} />
              ) : (
                <p className="text-gray-500 font-medium">No records found</p>
              )}
            </div>

            <div className="p-4 rounded-md border">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={ContactDetailSections.ClosedActivities}
              >
                {ContactDetailSections.ClosedActivities}
              </div>
              {closedTasks && closedTasks.length > 0 ? (
                <TaskList source="contact" tasks={closedTasks} />
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
      client.prefetchQuery('users', getRawUsers(token)),
      client.prefetchQuery('accounts', getRawAccounts(token)),
      client.prefetchQuery(
        ['contact', id, 'notes', 'first', false],
        getNotes(
          {
            source: 'contact',
            sourceId: id,
            sort: 'first',
            shouldNotPaginate: false,
            nTopRecent: DEFAULT_NUM_NOTE,
          },
          token,
        ),
      ),
    ])
  }

  return {
    notFound:
      investigate(client, ['contact', id]).isError ||
      ((await checkActionError(
        req,
        Actions.Contact.VIEW_ALL_CONTACT_DETAILS,
        Actions.Contact.VIEW_AND_EDIT_ALL_CONTACT_DETAILS,
      )) &&
        !(await useServerSideOwnership(req, client, ['contact', id]))),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default ContactDetail
