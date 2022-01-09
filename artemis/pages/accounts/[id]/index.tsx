import AccountDetailNavbar from '@components/Accounts/AccountDetailNavbar'
import AccountDetailSidebar, {
  AccountDetailSections,
} from '@components/Accounts/AccountDetailSidebar'
import { yupResolver } from '@hookform/resolvers/yup'
import DealInfo from '@utils/components/DealInfo'
import InlineEdit from '@utils/components/InlineEdit'
import { Props } from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import TaskList from '@utils/components/TaskList'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useServerSideOwnership } from '@utils/hooks/useOwnership'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Account, AccountType } from '@utils/models/account'
import { Actions } from '@utils/models/role'
import { TaskStatus } from '@utils/models/task'
import { User } from '@utils/models/user'
import { getAccount, updateAccount } from '@utils/service/account'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'
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
  const disabled = !auth[Actions.VIEW_AND_EDIT_ALL_ACCOUNT_DETAILS]

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
    console.trace()
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
  return (
    <Layout title={`CRM | Account | ${account?.fullName}`} requireLogin>
      <div className="crm-container">
        <AccountDetailNavbar data={account} />

        <div className="grid grid-cols-[250px,1fr]">
          <AccountDetailSidebar />

          <div className="flex flex-col divide-y gap-4">
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
            <div className="pt-4">
              <div
                className="font-semibold mb-4 text-[17px]"
                id={AccountDetailSections.OpenActivities}
              >
                {AccountDetailSections.OpenActivities}
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
                id={AccountDetailSections.ClosedActivities}
              >
                {AccountDetailSections.ClosedActivities}
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
      client.prefetchQuery(['account', id], getAccount(id, token)),
      client.prefetchQuery(
        'users',
        getUsers({ shouldNotPaginate: true }, token),
      ),
    ])
  }

  return {
    notFound:
      investigate(client, ['account', id]).isError ||
      ((await checkActionError(
        req,
        Actions.VIEW_ALL_ACCOUNT_DETAILS,
        Actions.VIEW_AND_EDIT_ALL_ACCOUNT_DETAILS,
      )) &&
        !(await useServerSideOwnership(req, client, ['account', id]))),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default AccountDetail
