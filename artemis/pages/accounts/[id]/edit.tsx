import Input from '@utils/components/Input'
import { getSessionToken } from '@utils/libs/getToken'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { dehydrate, QueryClient, useMutation, useQuery } from 'react-query'
import { User } from '@utils/models/user'
import Layout from '@utils/components/Layout'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { getAccount, updateAccount } from '@utils/service/account'
import { Account, AccountType } from '@utils/models/account'
import { phoneRegExp } from '@utils/data/regex'
import { AccountUpdateData, Field } from '@utils/data/update-account-data'
import { investigate } from '@utils/libs/investigate'
import { checkActionError } from '@utils/libs/checkActions'
import { Actions } from '@utils/models/role'

export type AccountUpdateFormData = {
  ownerId: string
  fullName: string
  phoneNum: string | null
  address: string | null
  description: string | null
  type: AccountType
}

export const editAccountSchema = yup.object().shape({
  ownerId: yup.string().required('Account Owner is required.'),
  fullName: yup
    .string()
    .required('Account Name is required.')
    .max(100, 'Account Name must be at most 100 characters.'),
  phoneNum: yup
    .string()
    .required('Phone is required.')
    .matches(phoneRegExp, 'Phone is invalid.'),
  description: yup
    .string()
    .max(500, 'Description must be at most 500 characters.')
    .nullable(true),
  address: yup
    .string()
    .max(250, 'Address must be at most 250 characters.')
    .nullable(true),
  type: yup.string().required('Account Type is required.'),
})

const EditAccount = () => {
  const { push, query } = useRouter()
  const id = query.id as string

  const { data: owners } = useQuery<User[]>(['users'], {
    enabled: false,
  })

  const { data: account } = useQuery<Account>(['account', id], {
    enabled: false,
  })

  const ownerOptions = owners?.map((owner) => ({
    value: owner.id,
    option: owner.name,
  }))

  const selectChildren = {
    ownerId: ownerOptions?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.option}
      </option>
    )),
  }

  const { isLoading, mutateAsync } = useMutation(
    'edit-account',
    updateAccount,
    {
      onSuccess: (res) => {
        notification.success({
          message: 'Edit account successfully.',
        })
        push(`/accounts/${res.id}`)
      },
      onError: () => {
        notification.error({ message: 'Edit account unsuccessfully.' })
      },
    },
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountUpdateFormData>({
    mode: 'all',
    resolver: yupResolver(editAccountSchema),
    defaultValues: {
      ownerId: account?.owner?.id,
      fullName: account?.fullName,
      phoneNum: account?.phoneNum,
      address: account?.address,
      description: account?.description,
      type: account?.type,
    },
  })

  const editAccount = handleSubmit((data) => {
    mutateAsync({ id, accountInfo: data })
  })

  const renderField = ({
    name,
    label,
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
          error={errors[name as keyof AccountUpdateFormData]?.message}
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
                name in selectChildren ? (
                  <>{selectChildren[name as 'ownerId']}</>
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
            ...register(name as keyof AccountUpdateFormData),
          }}
        />
      </div>
    </div>
  )

  return (
    <Layout requireLogin title="CRM | Edit account">
      <form
        noValidate
        onSubmit={editAccount}
        className="crm-container grid grid-cols-[1fr,180px] gap-4 pt-6"
      >
        <div>
          {AccountUpdateData.map(({ title, items }) => (
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
            type="button"
            className="crm-button-outline"
            onClick={() => push(`/accounts/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="crm-button"
            onClick={editAccount}
            disabled={isLoading}
          >
            Save
          </button>
        </div>
      </form>
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
      client.prefetchQuery(['account', id], getAccount(id, token)),
    ])
  }

  return {
    notFound:
      investigate(client, ['account', id]).isError ||
      (await checkActionError(req, Actions.VIEW_AND_EDIT_ALL_ACCOUNT_DETAILS)),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default EditAccount
