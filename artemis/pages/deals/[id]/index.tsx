import { yupResolver } from '@hookform/resolvers/yup'
import { notification } from 'antd'
import DealDetailNavbar from 'components/Deals/DealDetailNavbar'
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

import ConfirmClosedLost from '@components/Deals/ConfirmClosedLost'
import ConfirmClosedWon from '@components/Deals/ConfirmClosedWon'
import DealDetailSidebar from '@components/Deals/DealDetailSidebar'
import LogSection from '@components/Logs/LogSection'
import { INoteData } from '@components/Notes/NoteAdder'
import { DEFAULT_NUM_NOTE, NoteSection } from '@components/Notes/NoteSection'

import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import InlineEdit from '@utils/components/InlineEdit'
import { Props } from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import TaskList from '@utils/components/TaskList'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useModal } from '@utils/hooks/useModal'
import { useOwnership, useServerSideOwnership } from '@utils/hooks/useOwnership'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { Deal, DealStage, LossStages, UpdateDealDto } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'
import { LogSource } from '@utils/models/log'
import { AddNoteDto } from '@utils/models/note'
import { Actions } from '@utils/models/role'
import { TaskStatus } from '@utils/models/task'
import { User } from '@utils/models/user'
import { getAccounts, getRawAccounts } from '@utils/service/account'
import { getContacts, getRawContacts } from '@utils/service/contact'
import { getDeal, updateDeal } from '@utils/service/deal'
import {
  SortNoteType,
  addNote,
  deleteNote,
  editNote,
  getNotes,
} from '@utils/service/note'
import { getRawUsers, getUsers } from '@utils/service/user'

import { DealUpdateFormData, EditDealSchema } from './edit'

enum RelatedList {
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
}

const dealSidebarOptions: SidebarStructure = [
  {
    title: 'Related List',
    options: Object.values(RelatedList).map((item) => ({
      label: item,
    })),
  },
  {
    title: 'Sales Summary',
    options: [
      {
        label: 'Lead Conversion Time: NA',
      },
    ],
  },
]

type DealInfo = {
  label: string
  props: Omit<Props<'input' | 'textarea' | 'select' | undefined>, 'editable'>
}

const fields =
  (disabled?: boolean) =>
  ({
    register,
    errors,
    users,
    accounts,
    contacts,
  }: {
    register: UseFormRegister<DealUpdateFormData>
    errors: FieldErrors<DealUpdateFormData>
    users: User[]
    accounts: Account[]
    contacts: Contact[]
  }): Array<DealInfo> =>
    [
      {
        label: 'Deal Owner',
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
            id: 'deal-owner',
            ...register('ownerId'),
          },
        },
      },
      {
        label: 'Deal Name',
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
        label: 'Account Name',
        props: {
          as: 'select',
          error: errors.accountId?.message,
          props: {
            disabled,
            children: (
              <>
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
        label: 'Closing Date',
        props: {
          error: errors.closingDate?.message,
          props: {
            type: 'date',
            disabled,
            id: 'closing-date',
            ...register('closingDate'),
          },
        },
      },
      {
        label: 'Amount',
        props: {
          error: errors.amount?.message,
          props: {
            type: 'text',
            disabled,
            id: 'amount',
            ...register('amount'),
          },
        },
      },
      {
        label: 'Stage',
        props: {
          error: errors.stage?.message,
          as: 'select',
          props: {
            id: 'stage',
            disabled,
            children: (
              <>
                {Object.values(DealStage).map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </>
            ),
            ...register('stage'),
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
        label: 'Contact Name',
        props: {
          as: 'select',
          error: errors.contactId?.message,
          props: {
            disabled,
            children: (
              <>
                <option key="none" value="None">
                  None
                </option>
                {contacts.map(({ id, fullName }) => (
                  <option key={id} value={id}>
                    {fullName}
                  </option>
                ))}
              </>
            ),
            id: 'contact',
            ...register('contactId'),
          },
        },
      },
      {
        label: 'Probability (%)',
        props: {
          error: errors.probability?.message,
          props: {
            disabled,
            type: 'text',
            id: 'probability',
            ...register('probability'),
          },
        },
      },
      {
        label: 'Description',
        props: {
          error: errors.description?.message,
          props: {
            disabled,
            type: 'text',
            id: 'desc',
            ...register('description'),
          },
        },
      },
    ]

const DealDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  const [session] = useTypedSession()
  const auth = useAuthorization()

  const client = useQueryClient()
  const { data: users } = useQuery<User[]>('users', { enabled: false })
  const { data: contacts } = useQuery<Contact[]>('contacts', { enabled: false })
  const { data: accounts } = useQuery<Account[]>('accounts', { enabled: false })
  const { data: deal } = useQuery<Deal>(['deal', id], getDeal(id))

  const [sortNote, setSortNote] = useState<SortNoteType>('first')
  const [viewAllNote, setViewAllNote] = useState(false)

  const { data: notes } = useQuery<any>(
    ['deal', id, 'notes', sortNote, viewAllNote],
    getNotes({
      source: 'deal',
      sourceId: id,
      sort: sortNote,
      shouldNotPaginate: viewAllNote,
      nTopRecent: viewAllNote ? undefined : DEFAULT_NUM_NOTE,
    }),
  )

  const isOwner = useOwnership(deal)

  const defaultValues = useMemo(
    () => ({
      ownerId: deal?.owner?.id,
      fullName: deal?.fullName,
      accountId: deal?.account?.id,
      amount: deal?.amount,
      closingDate: deal?.closingDate,
      stage: deal?.stage,
      source: deal?.source || LeadSource.NONE,
      contactId: deal?.contact?.id || 'None',
      probability: deal?.probability,
      description: deal?.description || '',
    }),
    [deal],
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DealUpdateFormData>({
    mode: 'onChange',
    resolver: yupResolver(EditDealSchema),
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues])

  const [closeStage, setCloseStage] = useState<LossStages | undefined>()

  const { mutateAsync } = useMutation(['update-deal', id], updateDeal, {
    onSuccess() {
      notification.success({ message: 'Update deal successfully' })
      client.invalidateQueries(['deal', id])
      client.refetchQueries([id, 'detail-log'])
    },
    onError() {
      notification.error({ message: 'Update deal unsuccessfully' })
    },
  })

  const [visibleConfirmClosedWon, openConfirmCloseWon, closeConfirmCloseWon] =
    useModal()
  const [
    visibleConfirmClosedLost,
    openConfirmCloseLost,
    closeConfirmCloseLost,
  ] = useModal()

  const finishDeal = (dealId: string, updateDealDto: UpdateDealDto) => {
    mutateAsync({
      id: dealId,
      dealInfo: updateDealDto,
    })
  }

  const submit = useCallback(
    handleSubmit((data) => {
      if (data.contactId === 'None') {
        data.contactId = null
      }

      const isMarkDealAsClosedWon =
        deal?.stage !== DealStage.CLOSED_WON &&
        data.stage === DealStage.CLOSED_WON

      const isMarkDealAsClosedLoss =
        (deal?.stage !== DealStage.CLOSED_LOST &&
          data.stage === DealStage.CLOSED_LOST) ||
        (deal?.stage !== DealStage.CLOSED_LOST_TO_COMPETITION &&
          data.stage === DealStage.CLOSED_LOST_TO_COMPETITION)

      if (isMarkDealAsClosedWon) {
        openConfirmCloseWon()
        return
      }

      if (isMarkDealAsClosedLoss) {
        setCloseStage(data.stage as LossStages)
        openConfirmCloseLost()
        return
      }

      mutateAsync({ dealInfo: data, id })
    }),
    [id],
  )

  const openTasks = useMemo(
    () => deal?.tasks?.filter((task) => task.status !== TaskStatus.COMPLETED),
    [deal],
  )
  const closedTasks = useMemo(
    () => deal?.tasks?.filter((task) => task.status === TaskStatus.COMPLETED),
    [deal],
  )

  const { mutateAsync: addNoteService } = useMutation(
    'add-note-deal',
    addNote,
    {
      onSuccess() {
        client.invalidateQueries(['deal', id, 'notes'])
      },
      onError() {
        notification.error({ message: 'Add note unsuccessfully' })
      },
    },
  )

  const handleAddNote = (data: INoteData) => {
    const dataInfo: AddNoteDto = {
      ownerId: session?.user.id as string,
      dealId: deal?.id,
      source: 'deal',
      ...data,
    }
    addNoteService(dataInfo)
  }

  const { mutateAsync: editNoteService } = useMutation(
    'edit-note-deal',
    editNote,
    {
      onSuccess() {
        client.invalidateQueries(['deal', id, 'notes'])
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
    'delete-note-deal',
    deleteNote,
    {
      onSuccess() {
        client.invalidateQueries(['deal', id, 'notes'])
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
    <Layout title={`CRM | Deal | ${deal?.fullName}`} requireLogin>
      {deal && (
        <ConfirmClosedWon
          deal={deal}
          visible={visibleConfirmClosedWon}
          onCloseModal={closeConfirmCloseWon}
          onUpdateDeal={finishDeal}
        />
      )}
      {deal && closeStage && (
        <ConfirmClosedLost
          deal={deal}
          stage={closeStage}
          visible={visibleConfirmClosedLost}
          onCloseModal={closeConfirmCloseLost}
          onUpdateDeal={finishDeal}
        />
      )}
      <div className="crm-container">
        <DealDetailNavbar deal={deal!} />

        <div className="grid grid-cols-[250px,1fr]">
          <DealDetailSidebar />
          <div className="flex flex-col divide-y gap-4 ml-5">
            <div>
              <div className="font-semibold mb-4 text-[17px]">Overview</div>
              <form onSubmit={submit} className="flex flex-col gap-2">
                {fields(
                  !auth[Actions.Deal.VIEW_AND_EDIT_ALL_DEAL_DETAILS] &&
                    !isOwner,
                )({
                  register,
                  errors,
                  users: users || [],
                  accounts: accounts || [],
                  contacts: contacts || [],
                }).map(({ label, props }) => (
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
              noteFor="deal"
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              notes={viewAllNote ? notes || [] : notes?.items || []}
              totalNotes={notes?.meta?.totalItems || 0}
              onDeleteNote={handleDeleteNote}
              onChangeFilterSort={handleChangeFilterSort}
              onViewAllNote={setViewAllNote}
            />

            <LogSection source={LogSource.DEAL} entityId={id} title={'Logs'} />

            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={RelatedList.OpenActivities}
              >
                {RelatedList.OpenActivities}
              </div>
              {openTasks && openTasks.length > 0 ? (
                <TaskList source="deal" tasks={openTasks} />
              ) : (
                <p className="text-gray-500 font-medium">No records found</p>
              )}
            </div>

            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={RelatedList.ClosedActivities}
              >
                {RelatedList.ClosedActivities}
              </div>
              {closedTasks && closedTasks.length > 0 ? (
                <TaskList source="deal" tasks={closedTasks} />
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
      client.prefetchQuery(['deal', id], getDeal(id, token)),
      client.prefetchQuery('users', getRawUsers(token)),
      client.prefetchQuery('accounts', getRawAccounts(token)),
      client.prefetchQuery('contacts', getRawContacts(token)),
      client.prefetchQuery(
        ['deal', id, 'notes', 'first', false],
        getNotes(
          {
            source: 'deal',
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
      investigate(client, ['deal', id]).isError ||
      ((await checkActionError(
        req,
        Actions.Deal.VIEW_ALL_DEAL_DETAILS,
        Actions.Deal.VIEW_AND_EDIT_ALL_DEAL_DETAILS,
      )) &&
        !(await useServerSideOwnership(req, client, ['deal', id]))),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default DealDetail
