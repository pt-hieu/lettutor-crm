import { yupResolver } from '@hookform/resolvers/yup'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { QueryClient, dehydrate, useMutation, useQuery } from 'react-query'
import * as yup from 'yup'

import ConfirmReasonForLoss from '@components/Deals/ConfirmReasonForLoss'

import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import { DealUpdateData, Field } from '@utils/data/update-deal-data'
import { useModal } from '@utils/hooks/useModal'
import { useServerSideOwnership } from '@utils/hooks/useOwnership'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import {
  Deal,
  DealStageData,
  LossStages,
  UpdateDealDto,
} from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'
import { Actions } from '@utils/models/role'
import { User } from '@utils/models/user'
import { getRawAccounts } from '@utils/service/account'
import { getRawContacts } from '@utils/service/contact'
import { getDeal, getDealStages, updateDeal } from '@utils/service/deal'
import { getRawUsers } from '@utils/service/user'

export type DealUpdateFormData = {
  ownerId: string
  accountId: string
  contactId: string | null
  fullName: string
  amount: number | null
  closingDate: Date
  source: LeadSource
  probability: number | null
  description: string | null
  stageId: string
}

export const EditDealSchema = yup.object().shape({
  ownerId: yup.string().required('Deal Owner is required.'),
  fullName: yup
    .string()
    .required('Deal Name is required.')
    .max(100, 'Deal Name must be at most 100 characters.'),
  accountId: yup.string().required('Account Name is required.'),
  amount: yup
    .number()
    .typeError('Amount must be a number.')
    .nullable(true)
    .transform((v, o) => (o === '' ? null : v)),
  closingDate: yup
    .date()
    .required('Closing Date is required.')
    .typeError('Closing Date is not valid'),
  stageId: yup.string().required('Stage is required.'),
  source: yup.string().required('Lead Source is required.'),
  contactId: yup.string(),
  probability: yup
    .number()
    .typeError('Probability must be a number')
    .min(0, 'Probability must be at least 0')
    .max(100, 'Probability must be at most 100')
    .nullable(true)
    .transform((v, o) => (o === '' ? null : v)),
  description: yup
    .string()
    .max(500, 'Description must be at most 500 characters.')
    .nullable(true),
})

const EditDeal = () => {
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

  const { data: deal } = useQuery<Deal>(['deal', id], { enabled: false })

  const ownerOptions = owners?.map((owner) => ({
    value: owner.id,
    option: owner.name,
  }))

  const accoutOptions = accounts?.map((account) => ({
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

  const selectChildren = {
    ownerId: ownerOptions?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.option}
      </option>
    )),
    accountId: accoutOptions?.map((option) => (
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

  const { isLoading, mutateAsync } = useMutation('edit-deal', updateDeal, {
    onSuccess: (res) => {
      notification.success({
        message: 'Edit deal successfully.',
      })
      push(`/deals/${res.id}`)
    },
    onError: () => {
      notification.error({ message: 'Edit deal unsuccessfully.' })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DealUpdateFormData>({
    mode: 'onChange',
    resolver: yupResolver(EditDealSchema),
    defaultValues: {
      ownerId: deal?.owner?.id,
      accountId: deal?.account.id,
      contactId: deal?.contact?.id,
      fullName: deal?.fullName,
      amount: deal?.amount,
      closingDate: deal?.closingDate,
      stageId: deal?.stage.id,
      source: deal?.source,
      probability: deal?.probability,
      description: deal?.description,
    },
  })

  const [closeStage, setCloseStage] = useState<LossStages | undefined>()
  const [
    visibleConfirmClosedLost,
    openConfirmCloseLost,
    closeConfirmCloseLost,
  ] = useModal()

  const [updatedData, setUpdatedData] = useState<UpdateDealDto | undefined>()

  const finishDeal = (dealId: string, updateDealDto: UpdateDealDto) => {
    mutateAsync({
      id: dealId,
      dealInfo: { ...updatedData, ...updateDealDto },
    })
  }

  const editDeal = handleSubmit((data) => {
    if (data.contactId === 'None') {
      data.contactId = null
    }

    // const isMarkDealAsClosedLoss =
    //   (deal?.stage !== DealStage.CLOSED_LOST &&
    //     data.stage === DealStage.CLOSED_LOST) ||
    //   (deal?.stage !== DealStage.CLOSED_LOST_TO_COMPETITION &&
    //     data.stage === DealStage.CLOSED_LOST_TO_COMPETITION)

    // if (isMarkDealAsClosedLoss) {
    //   setUpdatedData(data)
    //   setCloseStage(data.stage as LossStages)
    //   openConfirmCloseLost()
    //   return
    // }

    mutateAsync({ id, dealInfo: data })
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
                  <>
                    {
                      selectChildren[
                        name as 'contactId' | 'ownerId' | 'accountId'
                      ]
                    }
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
            ...register(name as keyof DealUpdateFormData),
          }}
        />
      </div>
    </div>
  )

  return (
    <Layout requireLogin title="CRM | Edit lead">
      {deal && closeStage && (
        <ConfirmReasonForLoss
          deal={deal}
          stage={closeStage}
          visible={visibleConfirmClosedLost}
          onCloseModal={closeConfirmCloseLost}
          onUpdateDeal={finishDeal}
        />
      )}
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
            onClick={() => push(`/deals/${id}`)}
          >
            Cancel
          </button>
          <button
            type="button"
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
      client.prefetchQuery(['deal', id], getDeal(id, token)),
      client.prefetchQuery(['deal-stages'], getDealStages(token)),
    ])
  }

  return {
    notFound:
      investigate(client, ['deal', id]).isError ||
      ((await checkActionError(
        req,
        Actions.Deal.VIEW_AND_EDIT_ALL_DEAL_DETAILS,
      )) &&
        !(await useServerSideOwnership(req, client, ['deal', id]))),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default EditDeal
