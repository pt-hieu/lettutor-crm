import LogSection from '@components/Logs/LogSection'
import { INoteData } from '@components/Notes/NoteAdder'
import { DEFAULT_NUM_NOTE, NoteSection } from '@components/Notes/NoteSection'
import { yupResolver } from '@hookform/resolvers/yup'
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
import { Lead, LeadSource, LeadStatus } from '@utils/models/lead'
import { LogSource } from '@utils/models/log'
import { AddNoteDto, Note } from '@utils/models/note'
import { Paginate } from '@utils/models/paging'
import { Actions } from '@utils/models/role'
import { TaskStatus } from '@utils/models/task'
import { User } from '@utils/models/user'
import { getLead, updateLead } from '@utils/service/lead'
import {
  addNote,
  deleteNote,
  editNote,
  getNotes,
  SortNoteType,
} from '@utils/service/note'
import { getRawUsers } from '@utils/service/user'
import { notification } from 'antd'
import LeadDetailNavbar from 'components/Leads/LeadDetailNavbar'
import LeadDetailSidebar, {
  LeadDetailSections,
} from 'components/Leads/LeadDetailSidebar'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldErrors, useForm, UseFormRegister } from 'react-hook-form'
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'
import { editLeadSchema, LeadUpdateFromData } from './edit'

type LeadInfo = {
  label: string
  props: Omit<Props<'input' | 'textarea' | 'select' | undefined>, 'editable'>
}

const fields =
  (disabled?: boolean) =>
  (
    register: UseFormRegister<LeadUpdateFromData>,
    errors: FieldErrors<LeadUpdateFromData>,
    users: User[],
  ): Array<LeadInfo> =>
    [
      {
        label: 'Lead Owner',
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
            id: 'lead-owner',
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
            disabled,
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
            disabled,
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
            disabled,
            ...register('phoneNum'),
          },
        },
      },
      {
        label: 'Lead Status',
        props: {
          error: errors.status?.message,
          as: 'select',
          props: {
            id: 'status',
            disabled,
            children: (
              <>
                {Object.values(LeadStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </>
            ),
            ...register('status'),
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
            disabled,
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
        label: 'Address',
        props: {
          error: errors.address?.message,
          props: {
            type: 'text',
            disabled,
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
            disabled,
            ...register('description'),
          },
        },
      },
    ]

const LeadDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  const client = useQueryClient()
  const { data: lead } = useQuery<Lead>(['lead', id], getLead(id))
  const { data: users } = useQuery<User[]>('users', { enabled: false })

  const [sortNote, setSortNote] = useState<SortNoteType>('first')
  const [viewAllNote, setViewAllNote] = useState(false)

  const { data: notes } = useQuery<any>(
    ['lead', id, 'notes', sortNote, viewAllNote],
    getNotes({
      source: 'lead',
      sourceId: id,
      sort: sortNote,
      shouldNotPaginate: viewAllNote,
      nTopRecent: viewAllNote ? undefined : DEFAULT_NUM_NOTE,
    }),
  )

  const auth = useAuthorization()
  const isOwner = useOwnership(lead)

  const [session] = useTypedSession()

  const defaultValues = useMemo(
    () => ({
      ownerId: lead?.owner?.id,
      fullName: lead?.fullName,
      email: lead?.email,
      status: lead?.status || LeadStatus.NONE,
      source: lead?.source || LeadSource.NONE,
      address: lead?.address || '',
      description: lead?.description || '',
      phoneNum: lead?.phoneNum || '',
    }),
    [lead],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadUpdateFromData>({
    mode: 'onChange',
    resolver: yupResolver(editLeadSchema),
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues])

  const { mutateAsync } = useMutation(['update-lead', id], updateLead, {
    onSuccess() {
      notification.success({ message: 'Update lead successfully' })
      client.invalidateQueries(['lead', id])
      client.refetchQueries([id, 'detail-log'])
    },
    onError() {
      notification.error({ message: 'Update lead unsuccessfully' })
    },
  })

  const submit = useCallback(
    handleSubmit((data) => {
      mutateAsync({ leadInfo: data, id })
    }),
    [id],
  )

  const openTasks = useMemo(
    () => lead?.tasks?.filter((task) => task.status !== TaskStatus.COMPLETED),
    [lead],
  )
  const closedTasks = useMemo(
    () => lead?.tasks?.filter((task) => task.status === TaskStatus.COMPLETED),
    [lead],
  )

  const { mutateAsync: addNoteLead } = useMutation('add-note-lead', addNote, {
    onSuccess() {
      client.invalidateQueries(['lead', id, 'notes'])
    },
    onError() {
      notification.error({ message: 'Add note unsuccessfully' })
    },
  })

  const handleAddNote = (data: INoteData) => {
    const dataInfo: AddNoteDto = {
      ownerId: session?.user.id as string,
      leadId: lead?.id,
      source: 'lead',
      ...data,
    }
    addNoteLead(dataInfo)
  }

  const { mutateAsync: editNoteService } = useMutation(
    'edit-note-lead',
    editNote,
    {
      onSuccess() {
        client.invalidateQueries(['lead', id, 'notes'])
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
    'delete-note-lead',
    deleteNote,
    {
      onSuccess() {
        client.invalidateQueries(['lead', id, 'notes'])
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
    <Layout title={`CRM | Lead | ${lead?.fullName}`} requireLogin>
      <div className="crm-container">
        <LeadDetailNavbar lead={lead} />

        <div className="grid grid-cols-[250px,1fr]">
          <LeadDetailSidebar />

          <div className="flex flex-col divide-y gap-4 ml-5">
            <div>
              <div className="font-semibold mb-4 text-[17px]">Overview</div>

              <form onSubmit={submit} className="flex flex-col gap-2">
                {fields(
                  !auth[Actions.Lead.VIEW_AND_EDIT_ALL_LEAD_DETAILS] &&
                    !isOwner,
                )(register, errors, users || []).map(({ label, props }) => (
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
                ))}
              </form>
            </div>

            <NoteSection
              noteFor="lead"
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              notes={viewAllNote ? notes || [] : notes?.items || []}
              totalNotes={notes?.meta?.totalItems || 0}
              onDeleteNote={handleDeleteNote}
              onChangeFilterSort={handleChangeFilterSort}
              onViewAllNote={setViewAllNote}
            />

            <LogSection
              entityId={id}
              source={LogSource.LEAD}
              title={LeadDetailSections.Logs}
            />

            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={LeadDetailSections.OpenActivities}
              >
                {LeadDetailSections.OpenActivities}
              </div>

              {openTasks && openTasks.length > 0 ? (
                <TaskList source="lead" tasks={openTasks} />
              ) : (
                <p className="text-gray-500 font-medium">No records found</p>
              )}
            </div>

            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={LeadDetailSections.ClosedActivities}
              >
                {LeadDetailSections.ClosedActivities}
              </div>

              {closedTasks && closedTasks.length > 0 ? (
                <TaskList source="lead" tasks={closedTasks} />
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
      client.prefetchQuery(['lead', id], getLead(id, token)),
      client.prefetchQuery('users', getRawUsers(token)),
      client.prefetchQuery(
        ['lead', id, 'notes', 'first', false],
        getNotes(
          {
            source: 'lead',
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
      investigate(client, ['lead', id]).isError ||
      ((await checkActionError(req, Actions.Lead.VIEW_ALL_LEAD_DETAILS)) &&
        !(await useServerSideOwnership(req, client, ['lead', id]))),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default LeadDetail
