import LeadsAddLayout from '@components/Leads/LeadsAddLayout'
import { Field, LeadAddData } from '@utils/add-lead-data'
import Input from '@utils/components/Input'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { IErrorResponse } from '@utils/libs/functionalTryCatch'
import { getSessionToken } from '@utils/libs/getToken'
import { LeadSource, LeadStatus } from '@utils/models/lead'
import { addLeadService } from '@utils/service/lead'
import { getUsers } from '@utils/service/user'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { RegisterOptions, useForm } from 'react-hook-form'
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'

export interface LeadAddFormData {
  ownerId: string
  fullName: string
  email: string
  status: LeadStatus
  source: LeadSource
  country: string
  city: string
  state: string
  street: string
  address?: string
  description: string
  phoneNum: string
}

const validation: (field: Field) => RegisterOptions = (field) => ({
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
  const [session, _] = useTypedSession()
  const { data: leadOwners } = useQuery(['users'], getUsers({}))
  const { push } = useRouter()

  const queryClient = useQueryClient()
  const { isLoading, mutateAsync } = useMutation('add-user', addLeadService, {
    onSuccess: (res) => {
      queryClient.invalidateQueries('leads')
      reset(initialValue)
      notification.success({
        message: 'Add new lead successfully.',
      })
      push(`/leads/${res.id}`)
    },
    onError: ({ response }: IErrorResponse) => {
      if (response) {
        notification.error({ message: response.data.message })
        return
      }
      notification.error({ message: 'Add new lead unsuccessfully' })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<LeadAddFormData>({
    shouldUseNativeValidation: true,
    defaultValues: initialValue,
  })

  useEffect(() => {
    setValue('ownerId', session?.user.id || '')
  }, [session?.user.id])

  const addLead = handleSubmit((data) => {
    const { country, city, state, street } = data
    const address = [street, state, city, country]
      .filter((item) => item)
      .join(', ')
    data.address = address
    mutateAsync(data)
  })

  const renderField = (field: Field) => {
    return (
      <div key={field.id} className="grid grid-cols-12 mb-6 gap-6">
        <label
          htmlFor={field.id}
          className={`col-span-3 mt-[10px] crm-label text-right ${
            field.validation?.required ? '' : "after:content-['']"
          }`}
        >
          {field.name}
        </label>
        <div className="col-span-9">
          <Input
            error={errors[field.id as keyof LeadAddFormData]?.message}
            as={field.as}
            props={{
              type: field.type,
              className: `text-sm p-3 min-h-[44px] ${
                field.id === 'description' ? 'w-[600px]' : 'w-full'
              }`,
              children:
                field.as === 'select' ? (
                  field.id === 'ownerId' ? (
                    <>
                      {leadOwners?.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      {field.selectSource?.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </>
                  )
                ) : undefined,
              ...register(
                field.id as keyof LeadAddFormData,
                field.validation ? validation(field) : undefined,
              ),
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <LeadsAddLayout>
      <div className="flex justify-end items-center sticky top-[72px] right-0">
        <div>
          <button
            className="crm-button-outline mr-3"
            onClick={() => push('/leads')}
          >
            Cancel
          </button>
        </div>
        <div>
          <button className="crm-button" onClick={addLead} disabled={isLoading}>
            Save
          </button>
        </div>
      </div>
      <div className="pr-36">
        {/* Lead Infomation Start */}
        {LeadAddData.map((section) => {
          return (
            <div key={section.title}>
              <h1 className="font-semibold text-lg text-gray-700 my-6">
                {section.title}
              </h1>
              <div className="grid grid-cols-12">
                {/* Info left side start*/}
                {'col1' in section && (
                  <div className="grid col-span-6 pr-28">
                    {section.col1!.map((field) => {
                      return renderField(field)
                    })}
                  </div>
                )}
                {'col2' in section && (
                  <div className="grid col-span-6 pr-28">
                    {section.col2!.map((field) => {
                      return renderField(field)
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </LeadsAddLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  if (token) {
    await Promise.all([client.prefetchQuery(['users'], getUsers({}, token))])
  }

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}
export default LeadsAdd
