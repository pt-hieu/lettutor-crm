import { yupResolver } from '@hookform/resolvers/yup'
import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import { DealUpdateData, Field } from '@utils/data/update-deal-data'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { getSessionToken } from '@utils/libs/getToken'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { DealStage } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'
import { User } from '@utils/models/user'
import { getAccounts } from '@utils/service/account'
import { getContacts } from '@utils/service/contact'
import { addDeal } from '@utils/service/deal'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { dehydrate, QueryClient, useMutation, useQuery } from 'react-query'
import { DealUpdateFormData, schema } from './[id]/edit'

const AddDeal = () => {
  const [session] = useTypedSession()
  const { push, query } = useRouter()
  const id = query.id as string

  const { data: owners } = useQuery<User[]>(['users'], {
    enabled: false,
  })

  const { data: contacts } = useQuery<Contact[]>(['contacts'], {
    enabled: false,
  })

  const { data: accounts } = useQuery<Account[]>(['accounts'], {
    enabled: false,
  })

  const ownerOptions = owners?.map((owner) => ({
    value: owner.id,
    option: owner.name,
  }))

  const accountOptions = accounts?.map((account) => ({
    value: account.id,
    option: account.fullName,
  }))

  const contactOptions = contacts?.map((contact) => ({
    value: contact.id,
    option: contact.fullName,
  }))

  contactOptions?.unshift({ value: 'None', option: 'None' })

  const selectChildren = {
    ownerId: ownerOptions?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.option}
      </option>
    )),
    accountId: accountOptions?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.option}
      </option>
    )),
    contactId: contactOptions?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.option}
      </option>
    )),
  }

  const { isLoading, mutateAsync } = useMutation('add-deal', addDeal, {
    onSuccess: (res) => {
      notification.success({
        message: 'Add deal successfully.',
      })
      push(`/deals/${res.id}`)
    },
    onError: () => {
      notification.error({ message: 'Add deal unsuccessfully.' })
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DealUpdateFormData>({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      ownerId: '',
      stage: DealStage.QUALIFICATION,
      source: LeadSource.NONE,
      contactId: 'None',
    },
  })

  useEffect(() => {
    setValue('ownerId', session?.user.id || '')
  }, [session?.user.id])

  const editDeal = handleSubmit((data) => {
    if (data.contactId === 'None') {
      data.contactId = null
    }

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
          error={errors[name as keyof DealUpdateFormData]?.message}
          as={as!}
          props={{
            type: type,
            className: `text-sm p-3 min-h-[44px] ${
              name === 'description' || name === 'address'
                ? 'w-[600px]'
                : 'w-full'
            }`,
            children:
              as === 'select' ? (
                name in selectChildren ? (
                  <>{selectChildren[name as keyof typeof selectChildren]}</>
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
            ...register(name as keyof DealUpdateFormData),
          }}
        />
      </div>
    </div>
  )

  return (
    <Layout requireLogin title="CRM | Add Deal">
      <div className="crm-container grid grid-cols-[1fr,180px] gap-4 pt-6">
        <div>
          {DealUpdateData.map(({ title, items }) => (
            <div className="flex flex-col gap-6" key={title}>
              <h1 className="font-semibold text-lg text-gray-700">{title}</h1>

              <div className="grid grid-cols-2 gap-4">
                {items.map((field) => renderField(field))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end sticky top-[72px] gap-3 max-h-[40px]">
          <button className="crm-button-outline" onClick={() => push(`/deals`)}>
            Cancel
          </button>
          <button
            className="crm-button"
            onClick={editDeal}
            disabled={isLoading}
          >
            Save
          </button>
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
      client.prefetchQuery(
        ['contacts'],
        getContacts({ shouldNotPaginate: true }, token),
      ),
      client.prefetchQuery(
        ['accounts'],
        getAccounts({ shouldNotPaginate: true }, token),
      ),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default AddDeal