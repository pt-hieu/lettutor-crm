import { yupResolver } from '@hookform/resolvers/yup'
import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import InlineEdit from '@utils/components/InlineEdit'
import { Props } from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import TaskList from '@utils/components/TaskList'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { Deal, DealStage, LossStages, UpdateDealDto } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'
import { TaskStatus } from '@utils/models/task'
import { User } from '@utils/models/user'
import { getAccounts } from '@utils/service/account'
import { getContacts } from '@utils/service/contact'
import { getDeal, updateDeal } from '@utils/service/deal'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import DealDetailNavbar from 'components/Deals/DealDetailNavbar'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldErrors, useForm, UseFormRegister } from 'react-hook-form'
import { useModal } from '@utils/hooks/useModal'
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'
import { DealUpdateFormData, EditDealSchema } from './edit'
import ConfirmClosedWon from '@components/Deals/ConfirmClosedWon'
import ConfirmClosedLost from '@components/Deals/ConfirmClosedLost'

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

const fields = ({
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
}): Array<DealInfo> => [
  {
    label: 'Deal Owner',
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

  const client = useQueryClient()
  const { data: users } = useQuery<User[]>('users', { enabled: false })
  const { data: contacts } = useQuery<Contact[]>('contacts', { enabled: false })
  const { data: accounts } = useQuery<Account[]>('accounts', { enabled: false })
  const { data: deal } = useQuery<Deal>(['deal', id], getDeal(id))

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
          <DetailPageSidebar data={dealSidebarOptions} />
          <div className="flex flex-col divide-y gap-4">
            <div>
              <div className="font-semibold mb-4 text-[17px]">Overview</div>
              <form onSubmit={submit} className="flex flex-col gap-2">
                {fields({
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
            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={RelatedList.OpenActivities}
              >
                {RelatedList.OpenActivities}
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
                id={RelatedList.ClosedActivities}
              >
                {RelatedList.ClosedActivities}
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
      client.prefetchQuery(['deal', id], getDeal(id, token)),
      client.prefetchQuery(
        'users',
        getUsers({ shouldNotPaginate: true }, token),
      ),
      client.prefetchQuery(
        'accounts',
        getAccounts({ shouldNotPaginate: true }, token),
      ),
      client.prefetchQuery(
        'contacts',
        getContacts({ shouldNotPaginate: true }, token),
      ),
    ])
  }

  return {
    notFound: investigate(client, ['deal', id], 'users', 'accounts', 'contacts')
      .isError,
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default DealDetail
