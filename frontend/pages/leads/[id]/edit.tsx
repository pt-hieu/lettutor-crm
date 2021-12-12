import { Field, LeadUpdateData } from '@utils/data/update-lead-data'
import Input from '@utils/components/Input'
import { getSessionToken } from '@utils/libs/getToken'
import { Lead } from '@utils/models/lead'
import { getLead, updateLead } from '@utils/service/lead'
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

export interface LeadUpdateFromData
  extends Pick<
    Lead,
    | 'fullName'
    | 'email'
    | 'status'
    | 'source'
    | 'description'
    | 'phoneNum'
    | 'address'
  > {
  ownerId: string
}

const phoneRegExp = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/

const schema = yup.object().shape({
  ownerId: yup.string().required('Lead Owner is required.'),
  email: yup
    .string()
    .email('Please enter a valid email address.')
    .max(100, 'Email must be at most 100 characters.')
    .required('Email is required.'),
  phoneNum: yup
    .string()
    .required('Phone is required.')
    .matches(phoneRegExp, 'Phone is invalid.'),
  status: yup.string().required('Lead Status is required.'),
  fullName: yup
    .string()
    .required('Full Name is required.')
    .max(100, 'Full Name must be at most 100 characters.'),
  source: yup.string().required('Lead Source is required.'),
  description: yup
    .string()
    .max(500, 'Description must be at most 500 characters.'),
  address: yup.string().max(100, 'Address must be at most 250 characters.'),
})

const EditLead = () => {
  const { push, query } = useRouter()
  const id = query.id as string

  const { data: leadOwners } = useQuery<User[]>(['users'], {
    enabled: false,
  })

  const { data: lead } = useQuery<Lead>(['lead', id], { enabled: false })

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
  } = useForm<LeadUpdateFromData>({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      ownerId: lead?.owner.id,
      fullName: lead?.fullName,
      email: lead?.email,
      status: lead?.status,
      source: lead?.source,
      address: lead?.address,
      description: lead?.description,
      phoneNum: lead?.phoneNum,
    },
  })

  const editLead = handleSubmit((data) => {
    mutateAsync({ id, leadInfo: data })
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
          error={errors[name as keyof LeadUpdateFromData]?.message}
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
                name === 'ownerId' ? (
                  <>
                    {leadOwners?.map((item) => (
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
            ...register(name as keyof LeadUpdateFromData),
          }}
        />
      </div>
    </div>
  )

  return (
    <Layout requireLogin title="CRM | Edit lead">
      <div className="crm-container grid grid-cols-[1fr,180px] gap-4 pt-6">
        <div>
          {/* Lead Infomation Start */}
          {LeadUpdateData.map(({ title, items }) => (
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
            onClick={() => push(`/leads/${id}`)}
          >
            Cancel
          </button>
          <button
            className="crm-button"
            onClick={editLead}
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
      client.prefetchQuery(['lead', id], getLead(id, token)),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default EditLead
