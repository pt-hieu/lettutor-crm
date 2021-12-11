import Input from '@utils/components/Input'
import { getSessionToken } from '@utils/libs/getToken'
import { LeadSource } from '@utils/models/lead'
import { updateLead } from '@utils/service/lead'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { dehydrate, QueryClient, useMutation, useQuery } from 'react-query'
import { User } from '@utils/models/user'
import Layout from '@utils/components/Layout'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { DealUpdateData, Field } from '@utils/data/update-deal-data'
import { getDeal } from '@utils/service/deal'
import { Deal } from '@utils/models/deal'
import { getContacts } from '@utils/service/contact'

export type FormFields = {
  ownerId: string
  accountId: string
  contactId: string
  fullName: string
  amount: number | null
  closingDate: Date
  stage: string
  source: LeadSource
  probability: number | 10
  description: string | null
}

const schema = yup.object().shape({
  ownerId: yup.string().required('Deal Owner is required.'),
  fullName: yup
    .string()
    .required('Deal Name is required.')
    .max(100, 'Deal Name must be at most 100 characters.'),
  accountId: yup.string().required('Account Name is required.'),
  amount: yup.number().typeError('Amount must be a number.'),
  closingDate: yup.date().required('Closing Date is required.'),
  stage: yup.string().required('Stage is required.'),
  source: yup.string().required('Lead Source is required.'),
  contactId: yup.string(),
  probability: yup
    .number()
    .typeError('Probability must be a number')
    .min(0, 'Probability must be at least 0')
    .max(100, 'Probability must be at most 100'),
  description: yup
    .string()
    .max(500, 'Description must be at most 500 characters.'),
})

const EditDeal = () => {
  const { push, query } = useRouter()
  const id = query.id as string

  const { data: owner } = useQuery<User[]>(['users'], {
    enabled: false,
  })

  console.log('owner: ', owner)

  const { data: deal } = useQuery<Deal>(['deal', id], { enabled: false })

  console.log('lead: ', deal)

  const { isLoading, mutateAsync } = useMutation('edit-lead', updateLead, {
    onSuccess: (res) => {
      notification.success({
        message: 'Edit lead successfully.',
      })
      push(`/leads/${res.id}`)
    },
    onError: () => {
      notification.error({ message: 'Edit lead unsuccessfully.' })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      ownerId: deal?.owner.id,
      accountId: deal?.account.id,
      contactId: deal?.contact?.id,
      fullName: deal?.fullName,
      amount: deal?.amount,
      closingDate: deal?.closingDate,
      stage: deal?.stage,
      source: deal?.source,
      probability: deal?.probability,
      description: deal?.description,
    },
  })

  const editDeal = handleSubmit((data) => {
    console.log('I am here')
    //mutateAsync({ id, leadInfo: data })
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
          error={errors[name as keyof FormFields]?.message}
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
                <>
                  {selectSource?.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </>
              ) : undefined,
            ...register(name as keyof FormFields),
          }}
        />
      </div>
    </div>
  )

  return (
    <Layout requireLogin title="CRM | Edit lead">
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
          <button
            className="crm-button-outline"
            onClick={() => push(`/deals/${id}`)}
          >
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
      client.prefetchQuery(['deal', id], getDeal(id, token)),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default EditDeal
