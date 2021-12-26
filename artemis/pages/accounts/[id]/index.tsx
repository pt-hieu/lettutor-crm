import AccountDetailNavbar from '@components/Accounts/AccountDetailNavbar'
import AccountDetailSidebar from '@components/Accounts/AccountDetailSidebar'
import Layout from '@utils/components/Layout'
import { yupResolver } from '@hookform/resolvers/yup'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Account, AccountType } from '@utils/models/account'
import { User } from '@utils/models/user'
import { getAccount, updateAccount } from '@utils/service/account'
import { getUsers } from '@utils/service/user'
import moment from 'moment'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo } from 'react'
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'
import { Props } from '@utils/components/Input'
import { useForm } from 'react-hook-form'
import InlineEdit from '@utils/components/InlineEdit'
import { notification } from 'antd'
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
      ownerId: account?.owner.id || '',
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
  } , [defaultValues])

  const accountInfo: AccountInfo[] = [
    {
      label: 'Account Owner',
      props: {
        as: 'select',
        error: errors.ownerId?.message,
        props: {
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

  return (
    <Layout title={`CRM | Account | ${account?.fullName}`} requireLogin>
      <div className="crm-container">
        <AccountDetailNavbar
          fullName={account?.fullName || ''}
          id={account?.id || ''}
        />

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
              <div className="font-semibold mb-4 text-[17px]">Deals</div>
              {account?.deals?.map(
                ({ id, fullName, amount, stage, closingDate }) => (
                  <div key={id}>
                    <p className="font-semibold">
                      <Link href={`/deals/${id}`}>
                        <a className=" text-gray-700 hover:text-gray-600">
                          {fullName}
                        </a>
                      </Link>
                      <span className="bg-red-400 px-2 ml-4 text-white rounded-sm">
                        $ {amount}
                      </span>
                    </p>
                    <p>
                      <span>{stage}</span>
                      <span className="ml-4">
                        {moment(closingDate).format('DD/MM/YYYY')}
                      </span>
                    </p>
                  </div>
                ),
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
    notFound: investigate(client, ['account', id]).isError,
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default AccountDetail
