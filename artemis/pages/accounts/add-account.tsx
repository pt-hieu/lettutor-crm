import { yupResolver } from '@hookform/resolvers/yup'
import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import { AccountAddData } from '@utils/data/add-account-data'
import { Field } from '@utils/data/update-deal-data'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { Account, AccountType } from '@utils/models/account'
import { Actions } from '@utils/models/role'
import { User } from '@utils/models/user'
import { addAccount } from '@utils/service/account'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { dehydrate, QueryClient, useMutation, useQuery } from 'react-query'
import * as yup from 'yup'

export interface AccountAddFormData
  extends Pick<
    Account,
    'fullName' | 'type' | 'description' | 'phoneNum' | 'address'
  > {
  ownerId: string
}

const phoneRegExp = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/

const schema = yup.object().shape({
  ownerId: yup.string().required('Account Owner is required.'),
  phoneNum: yup.string().optional().matches(phoneRegExp, 'Phone is invalid.'),
  fullName: yup
    .string()
    .required('Full Name is required.')
    .max(100, 'Full Name must be at most 100 characters.'),
  description: yup
    .string()
    .max(500, 'Description must be at most 500 characters.'),
  address: yup.string().max(100, 'Address must be at most 250 characters.'),
})

const CreateAccount = () => {
  const [session] = useTypedSession()
  const { push } = useRouter()

  const { data: accountOwners } = useQuery<User[]>(['users'], {
    enabled: false,
  })

  const { isLoading, mutateAsync } = useMutation('add-account', addAccount, {
    onSuccess: (res) => {
      notification.success({
        message: 'Add account successfully.',
      })
      push(`/accounts/${res.id}`)
    },
    onError: () => {
      notification.error({ message: 'Add account unsuccessfully.' })
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AccountAddFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      ownerId: '',
      fullName: '',
      type: AccountType.NONE,
      address: '',
      description: '',
      phoneNum: '',
    },
  })

  useEffect(() => {
    setValue('ownerId', session?.user.id || '')
  }, [session?.user.id])

  const handleAddAccount = handleSubmit((data) => {
    mutateAsync(data)
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
          error={errors[name as keyof AccountAddFormData]?.message}
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
                    {accountOwners?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
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
            ...register(name as keyof AccountAddFormData),
          }}
        />
      </div>
    </div>
  )

  return (
    <Layout requireLogin title="CRM | Add account">
      <div className="crm-container grid grid-cols-[1fr,180px] gap-4 pt-6">
        <div>
          {/* Lead Infomation Start */}
          {AccountAddData.map(({ title, items }) => (
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
            onClick={() => push(`/accounts`)}
          >
            Cancel
          </button>
          <button
            className="crm-button"
            onClick={handleAddAccount}
            disabled={isLoading}
          >
            Submit
          </button>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const client = new QueryClient()
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
    ])
  }

  return {
    notFound: await checkActionError(req, Actions.CREATE_NEW_ACCOUNT),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default CreateAccount
