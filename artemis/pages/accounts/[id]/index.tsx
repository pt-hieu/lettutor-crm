import { yupResolver } from '@hookform/resolvers/yup'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'

import AccountDetailNavbar from '@components/Accounts/AccountDetailNavbar'
import AccountDetailSidebar, {
  AccountDetailSections,
} from '@components/Accounts/AccountDetailSidebar'
import LogSection from '@components/Logs/LogSection'
import { INoteData } from '@components/Notes/NoteAdder'
import { DEFAULT_NUM_NOTE, NoteSection } from '@components/Notes/NoteSection'

import DealInfo from '@utils/components/DealInfo'
import InlineEdit from '@utils/components/InlineEdit'
import { Props } from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import TaskList from '@utils/components/TaskList'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useServerSideOwnership } from '@utils/hooks/useOwnership'
import { useOwnership } from '@utils/hooks/useOwnership'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Account, AccountType } from '@utils/models/account'
import { LogSource } from '@utils/models/log'
import { AddNoteDto } from '@utils/models/note'
import { Actions } from '@utils/models/role'
import { TaskStatus } from '@utils/models/task'
import { User } from '@utils/models/user'
import { getAccount, updateAccount } from '@utils/service/account'
import {
  FilterNoteType,
  SortNoteType,
  addNote,
  deleteNote,
  editNote,
  getNotes,
} from '@utils/service/note'
import { getRawUsers } from '@utils/service/user'

import { AccountUpdateFormData, editAccountSchema } from './edit'

type AccountInfo = {
  label: string
  props: Omit<Props<'input' | 'textarea' | 'select' | undefined>, 'editable'>
}

const AccountDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  const { data: account } = useQuery<Account>(['account', id], getAccount(id))
  const { data: users } = useQuery<User[]>('users', { enabled: false })

  const [sortNote, setSortNote] = useState<SortNoteType>('first')
  const [filterNote, setFilterNote] = useState<FilterNoteType>()
  const [viewAllNote, setViewAllNote] = useState(false)

  const { data: notes } = useQuery<any>(
    ['account', id, 'notes', sortNote, `${filterNote}`, viewAllNote],
    getNotes({
      source: 'account',
      sourceId: id,
      sort: sortNote,
      filter: filterNote,
      shouldNotPaginate: viewAllNote,
      nTopRecent: viewAllNote ? undefined : DEFAULT_NUM_NOTE,
    }),
  )

  const defaultValues = useMemo(
    (): Partial<AccountUpdateFormData> => ({
      address: account?.address || '',
      description: account?.description || '',
      fullName: account?.fullName || '',
      ownerId: account?.owner?.id || '',
      phoneNum: account?.phoneNum || '',
      type: account?.type || AccountType.NONE,
    }),
    [account],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountUpdateFormData>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(editAccountSchema),
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues])

  const auth = useAuthorization()
  const isOwner = useOwnership(account)

  const [session] = useTypedSession()

  const disabled =
    !auth[Actions.Account.VIEW_AND_EDIT_ALL_ACCOUNT_DETAILS] && !isOwner

  const accountInfo: AccountInfo[] = [
    {
      label: 'Account Owner',
      props: {
        as: 'select',
        error: errors.ownerId?.message,
        props: {
          disabled,
          children: (
            <>
              {users?.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </>
          ),
          ...register('ownerId'),
          id: 'owner',
        },
      },
    },
    {
      label: 'Account Type',
      props: {
        as: 'select',
        error: errors.type?.message,
        props: {
          disabled,
          children: (
            <>
              {Object.values(AccountType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </>
          ),
          ...register('type'),
          id: 'type',
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
          ...register('phoneNum'),
          id: 'phoneNum',
        },
      },
    },
    {
      label: 'Address',
      props: {
        error: errors.address?.message,
        props: {
          disabled,
          ...register('address'),
          type: 'text',
          id: 'address',
        },
      },
    },
    {
      label: 'Description',
      props: {
        error: errors.description?.message,
        props: {
          disabled,
          ...register('description'),
          type: 'text',
          id: 'desc',
        },
      },
    },
  ]

  const client = useQueryClient()
  const { mutateAsync } = useMutation(['update-account', id], updateAccount, {
    onSuccess() {
      notification.success({ message: 'Update account successfully' })
      client.invalidateQueries(['account', id])
      client.refetchQueries([id, 'detail-log'])
    },
    onError() {
      notification.error({ message: 'Update account unsuccessfully' })
    },
  })

  const submit = useCallback(
    handleSubmit((data) => {
      mutateAsync({ id, accountInfo: data })
    }),
    [id],
  )
  const cancel = useCallback(() => {
    reset(defaultValues)
  }, [defaultValues])

  const openTasks = useMemo(
    () =>
      account?.tasksToDisplay?.filter(
        (task) => task.status !== TaskStatus.COMPLETED,
      ),
    [account],
  )
  const closedTasks = useMemo(
    () =>
      account?.tasksToDisplay?.filter(
        (task) => task.status === TaskStatus.COMPLETED,
      ),
    [account],
  )

  const { mutateAsync: addNoteService } = useMutation(
    'add-note-account',
    addNote,
    {
      onSuccess() {
        client.invalidateQueries(['account', id, 'notes'])
      },
      onError() {
        notification.error({ message: 'Add note unsuccessfully' })
      },
    },
  )

  const handleAddNote = (data: INoteData) => {
    const dataInfo: AddNoteDto = {
      ownerId: session?.user.id as string,
      accountId: account?.id,
      source: 'account',
      ...data,
    }
    addNoteService(dataInfo)
  }

  const { mutateAsync: editNoteService } = useMutation(
    'edit-note-account',
    editNote,
    {
      onSuccess() {
        client.invalidateQueries(['account', id, 'notes'])
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
    'delete-note-account',
    deleteNote,
    {
      onSuccess() {
        client.invalidateQueries(['account', id, 'notes'])
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

  const handleChangeFilterSort = ({
    sort,
    filter,
  }: {
    sort: SortNoteType
    filter?: FilterNoteType
  }) => {
    setSortNote(sort)
    setFilterNote(filter)
  }

  return (
    <Layout title={`CRM | Account | ${account?.fullName}`} requireLogin>
      <div className="crm-container">
        <AccountDetailNavbar data={account} />

        <div className="grid grid-cols-[250px,1fr]">
          <AccountDetailSidebar />

          <div className="flex flex-col divide-y gap-4 ml-5">
            <div>
              <div className="font-semibold mb-4 text-[17px]">Overview</div>
              <form onSubmit={submit} className="flex flex-col gap-4">
                {accountInfo.map(({ label, props }) => (
                  <div key={label} className="grid grid-cols-[250px,1fr] gap-4">
                    <span className="inline-block text-right font-medium pt-[8px]">
                      {label}
                    </span>

                    <InlineEdit
                      onEditCancel={cancel}
                      onEditComplete={submit}
                      {...props}
                    />
                  </div>
                ))}
              </form>
            </div>

            <NoteSection
              noteFor="account"
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              notes={viewAllNote ? notes || [] : notes?.items || []}
              totalNotes={notes?.meta?.totalItems || 0}
              onDeleteNote={handleDeleteNote}
              onChangeFilterSort={handleChangeFilterSort}
              onViewAllNote={setViewAllNote}
              hasFilter
            />

            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={AccountDetailSections.Deals}
              >
                {AccountDetailSections.Deals}
              </div>
              {account?.deals?.map(
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
              source={LogSource.ACCOUNT}
              title={AccountDetailSections.Logs}
              entityId={id}
            />

            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={AccountDetailSections.OpenActivities}
              >
                {AccountDetailSections.OpenActivities}
              </div>

              {openTasks && openTasks.length > 0 ? (
                <TaskList source="account" tasks={openTasks} />
              ) : (
                <p className="text-gray-500 font-medium">No records found</p>
              )}
            </div>

            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={AccountDetailSections.ClosedActivities}
              >
                {AccountDetailSections.ClosedActivities}
              </div>

              {closedTasks && closedTasks.length > 0 ? (
                <TaskList source="account" tasks={closedTasks} />
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
      client.prefetchQuery(['account', id], getAccount(id, token)),
      client.prefetchQuery('users', getRawUsers(token)),
      client.prefetchQuery(
        ['account', id, 'notes', 'first', 'undefined', false],
        getNotes(
          {
            source: 'account',
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
      investigate(client, ['account', id]).isError ||
      ((await checkActionError(
        req,
        Actions.Account.VIEW_ALL_ACCOUNT_DETAILS,
        Actions.Account.VIEW_AND_EDIT_ALL_ACCOUNT_DETAILS,
      )) &&
        !(await useServerSideOwnership(req, client, ['account', id]))),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default AccountDetail
