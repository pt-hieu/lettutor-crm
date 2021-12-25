import { Field, LeadAddData } from '@utils/data/add-lead-data'
import Input from '@utils/components/Input'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { getSessionToken } from '@utils/libs/getToken'
import { Lead, LeadSource, LeadStatus } from '@utils/models/lead'
import { addLeadService } from '@utils/service/lead'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, Fragment } from 'react'
import { RegisterOptions, useForm } from 'react-hook-form'
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'
import { User } from '@utils/models/user'
import Layout from '@utils/components/Layout'

export interface LeadAddFormData
  extends Pick<
    Lead,
    'fullName' | 'email' | 'status' | 'source' | 'description' | 'phoneNum'
  > {
  ownerId: string
  country: string
  city: string
  state: string
  street: string
  address?: string
}

export const validate: (field: Field) => RegisterOptions = (field) => ({
  required: {
    message: field.name + ' is required',
    value: true,
  },
  pattern: field.validation?.regExp,
})

const initialValue: LeadAddFormData = {
  ownerId: '',
  fullName: '',
  email: '',
  status: LeadStatus.NONE,
  source: LeadSource.NONE,
  country: '',
  city: '',
  state: '',
  street: '',
  description: '',
  phoneNum: '',
}

const LeadsAdd = () => {
  const [session] = useTypedSession()
  const { data: leadOwners } = useQuery<User[]>(['users'], {
    enabled: false,
  })
  const { push } = useRouter()

  const queryClient = useQueryClient()
  const { isLoading, mutateAsync } = useMutation('add-lead', addLeadService, {
    onSuccess: (res) => {
      queryClient.invalidateQueries('leads')
      notification.success({
        message: 'Add new lead successfully',
      })
      push(`/leads/${res.id}`)
    },
    onError: () => {
      notification.error({ message: 'Add new lead unsuccessfully' })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LeadAddFormData>({
    defaultValues: initialValue,
  })

  useEffect(() => {
    setValue('ownerId', session?.user.id || '')
  }, [session?.user.id])

  const addLead = handleSubmit((data) => {
    const { country, city, state, street } = data

    data.address = [street, state, city, country]
      .filter((item) => item)
      .join(', ')

    mutateAsync(data)
  })

  const renderField = ({
    id,
    name,
    as,
    selectSource,
    validation,
    type,
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
          error={errors[id as keyof LeadAddFormData]?.message}
          as={as!}
          props={{
            type: type || 'text',
            className: `text-sm p-3 min-h-[44px] ${
              id === 'description' ? 'w-[600px]' : 'w-full'
            }`,
            children:
              as === 'select' ? (
                id === 'ownerId' ? (
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
            ...register(
              id as keyof LeadAddFormData,
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
    <Layout requireLogin title="CRM | Add a new lead">
      <div className="crm-container grid grid-cols-[1fr,180px] gap-4 pt-6">
        <div>
          {/* Lead Infomation Start */}
          {LeadAddData.map(({ title, items }) => (
            <div className="flex flex-col gap-6" key={title}>
              <h1 className="font-semibold text-lg text-gray-700">{title}</h1>

              <div className="grid grid-cols-2 gap-4">
                {items.map((field) => renderField(field))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end sticky top-[72px] gap-3 max-h-[40px]">
          <button className="crm-button-outline" onClick={() => push('/leads')}>
            Cancel
          </button>
          <button className="crm-button" onClick={addLead} disabled={isLoading}>
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
        getUsers({ shouldNotPaginate: true }, token),
      ),
    ])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}
export default LeadsAdd
