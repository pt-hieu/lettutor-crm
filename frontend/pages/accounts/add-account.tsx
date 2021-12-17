import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import { AccountAddData } from '@utils/data/add-account-data'
import { Field } from '@utils/data/add-lead-data'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { getSessionToken } from '@utils/libs/getToken'
import { Account, AccountType } from '@utils/models/account'
import { User } from '@utils/models/user'
import { addAccount } from '@utils/service/account'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { validate } from 'pages/leads/add-lead'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { dehydrate, QueryClient, useMutation, useQuery } from 'react-query'

export interface AccountAddFormData
  extends Pick<
    Account,
    'fullName' | 'type' | 'description' | 'phoneNum' | 'address'
  > {
  ownerId: string
}

const CreateAccount = () => {
  const [session] = useTypedSession()
  const { push } = useRouter()

  const { data: contactOwners } = useQuery<User[]>(['users'], {
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
    mode: 'all',
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

  const handleAddContact = handleSubmit((data) => {
    mutateAsync(data)
  })

  const renderField = ({
    id,
    name,
    as,
    selectSource,
    type,
    validation,
  }: Field) => (
    <div key={id} className="grid grid-cols-3 mb-6 gap-6">
      <label
        htmlFor={id}
        className={`mt-[10px] crm-label text-right ${
          validation?.required ? '' : "after:content-['']"
        }`}
      >
        {name}
      </label>
      <div className="col-span-2">
        {/* @ts-ignore */}
        <Input
          error={errors[id as keyof AccountAddFormData]?.message}
          as={as!}
          props={{
            type: type,
            className: `text-sm p-3 min-h-[44px] ${
              id === 'description' || id === 'address' ? 'w-[600px]' : 'w-full'
            }`,
            children:
              as === 'select' ? (
                id === 'ownerId' ? (
                  <>
                    {contactOwners?.map(({ id, name }) => (
                      <option key={id} value={id}>
                        {name}
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
            ...register(
              id as keyof AccountAddFormData,
              validation
                ? validate({
                    id,
                    name,
                    as,
                    selectSource,
                    validation,
                    type,
                  })
                : undefined,
            ),
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
            onClick={handleAddContact}
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
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default CreateAccount
