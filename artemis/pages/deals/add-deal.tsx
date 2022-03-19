import { yupResolver } from '@hookform/resolvers/yup'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { QueryClient, dehydrate, useMutation, useQuery } from 'react-query'

import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import { DealUpdateData, Field } from '@utils/data/update-deal-data'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { DealStageData } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'
import { Actions } from '@utils/models/role'
import { User } from '@utils/models/user'
import { getRawAccounts } from '@utils/service/account'
import { getRawContacts } from '@utils/service/contact'
import { addDeal, getDealStages } from '@utils/service/deal'
import { getRawUsers } from '@utils/service/user'

import { DealUpdateFormData, EditDealSchema } from './[id]/edit'

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

  const { data: dealStages } = useQuery<DealStageData[]>(['deal-stages'], {
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

  const dealStageOptions = dealStages?.map((dealStage) => ({
    value: dealStage.id,
    option: dealStage.name,
  }))

  contactOptions?.unshift({ value: 'None', option: 'None' })
  dealStageOptions?.unshift({ value: '', option: 'None' })

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
    stageId: dealStageOptions?.map((option) => (
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
    resolver: yupResolver(EditDealSchema),
    defaultValues: {
      ownerId: '',
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

  const handleChangeStage = (value: string) => {
    if (!value) return
    const stageById = dealStages?.find((s) => s.id === value)

    if (!stageById) return
    const probability = stageById.probability

    setValue('probability', probability)
  }

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
            ...register(name as keyof DealUpdateFormData, {
              onChange:
                name === 'stageId'
                  ? (e) => handleChangeStage(e.target.value)
                  : undefined,
            }),
          }}
        />
      </div>
    </div>
  )

  return (
    <Layout requireLogin title="CRM | Add Deal">
      <form
        noValidate
        onSubmit={editDeal}
        className="crm-container grid grid-cols-[1fr,180px] gap-4 pt-6"
      >
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
          <button
            type="button"
            className="crm-button-outline"
            onClick={() => push(`/deals`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="crm-button"
            onClick={editDeal}
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
      client.prefetchQuery(['users'], getRawUsers(token)),
      client.prefetchQuery(['contacts'], getRawContacts(token)),
      client.prefetchQuery(['accounts'], getRawAccounts(token)),
      client.prefetchQuery(['deal-stages'], getDealStages(token)),
    ])
  }

  return {
    notFound: await checkActionError(req, Actions.Deal.CREATE_NEW_DEAL),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default AddDeal
