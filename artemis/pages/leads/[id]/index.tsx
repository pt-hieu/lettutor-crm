import Layout from '@utils/components/Layout'
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'
import { getSessionToken } from '@utils/libs/getToken'
import { GetServerSideProps } from 'next'
import { getLead, updateLead } from '@utils/service/lead'
import { useRouter } from 'next/router'
import LeadDetailSidebar from 'components/Leads/LeadDetailSidebar'
import LeadDetailNavbar from 'components/Leads/LeadDetailNavbar'
import { yupResolver } from '@hookform/resolvers/yup'
import { Lead, LeadSource, LeadStatus } from '@utils/models/lead'
import { investigate } from '@utils/libs/investigate'
import InlineEdit from '@utils/components/InlineEdit'
import { Props } from '@utils/components/Input'
import { editLeadSchema, LeadUpdateFromData } from './edit'
import { FieldErrors, useForm, UseFormRegister } from 'react-hook-form'
import { getUsers } from '@utils/service/user'
import { User } from '@utils/models/user'
import { notification } from 'antd'
import { useCallback, useMemo } from 'react'

type LeadInfo = {
  label: string
  props: Omit<Props<'input' | 'textarea' | 'select' | undefined>, 'editable'>
}

const fields = (
  register: UseFormRegister<LeadUpdateFromData>,
  errors: FieldErrors<LeadUpdateFromData>,
  users: User[],
): Array<LeadInfo> => [
  {
    label: 'Lead Owner',
    props: {
      as: 'select',
      error: errors.ownerId?.message,
      props: {
        children: (
          <>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </>
        ),
        id: 'lead-owner',
        ...register('ownerId'),
      },
    },
  },
  {
    label: 'Full Name',
    props: {
      error: errors.fullName?.message,
      props: {
        type: 'text',
        id: 'full-name',
        ...register('fullName'),
      },
    },
  },
  {
    label: 'Email',
    props: {
      error: errors.email?.message,
      props: {
        type: 'email',
        id: 'email',
        ...register('email'),
      },
    },
  },
  {
    label: 'Phone',
    props: {
      error: errors.phoneNum?.message,
      props: {
        type: 'text',
        id: 'phone',
        ...register('phoneNum'),
      },
    },
  },
  {
    label: 'Lead Status',
    props: {
      error: errors.status?.message,
      as: 'select',
      props: {
        id: 'status',
        children: (
          <>
            {Object.values(LeadStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </>
        ),
        ...register('status'),
      },
    },
  },
  {
    label: 'Lead Source',
    props: {
      error: errors.source?.message,
      as: 'select',
      props: {
        id: 'source',
        children: (
          <>
            {Object.values(LeadSource).map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </>
        ),
        ...register('source'),
      },
    },
  },
  {
    label: 'Address',
    props: {
      error: errors.address?.message,
      props: {
        type: 'text',
        id: 'address',
        ...register('address'),
      },
    },
  },
  {
    label: 'Description',
    props: {
      error: errors.description?.message,
      props: {
        type: 'text',
        id: 'desc',
        ...register('description'),
      },
    },
  },
]

const LeadDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  const client = useQueryClient()
  const { data: lead } = useQuery<Lead>(['lead', id], getLead(id))
  const { data: users } = useQuery<User[]>('users', { enabled: false })

  const defaultValues = useMemo(
    () => ({
      ownerId: lead?.owner?.id,
      fullName: lead?.fullName,
      email: lead?.email,
      status: lead?.status || LeadStatus.NONE,
      source: lead?.source || LeadSource.NONE,
      address: lead?.address || '',
      description: lead?.description || '',
      phoneNum: lead?.phoneNum || '',
    }),
    [lead],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadUpdateFromData>({
    mode: 'onChange',
    resolver: yupResolver(editLeadSchema),
    defaultValues,
  })

  const { mutateAsync } = useMutation(['update-lead', id], updateLead, {
    onSuccess() {
      notification.success({ message: 'Update lead successfully' })
      client.invalidateQueries(['lead', id])
    },
    onError() {
      notification.error({ message: 'Update lead unsuccessfully' })
    },
  })

  const submit = useCallback(
    handleSubmit((data) => {
      mutateAsync({ leadInfo: data, id })
    }),
    [id],
  )

  return (
    <Layout title={`CRM | Lead | ${lead?.fullName}`} requireLogin>
      <div className="crm-container">
        <LeadDetailNavbar lead={lead} />

        <div className="grid grid-cols-[250px,1fr]">
          <LeadDetailSidebar />

          <div>
            <div className="font-semibold mb-4 text-[17px]">Overview</div>
            <form onSubmit={submit} className="flex flex-col gap-2">
              {fields(register, errors, users || []).map(({ label, props }) => (
                <div key={label} className="grid grid-cols-[250px,350px] gap-4">
                  <span className="inline-block text-right font-medium pt-[10px]">
                    {label}
                  </span>
                  <InlineEdit
                    onEditCancel={() => reset(defaultValues)}
                    onEditComplete={submit}
                    {...props}
                  />
                </div>
              ))}
            </form>
          </div>
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
  const token = getSessionToken(req.cookies)
  const id = params?.id as string

  if (token) {
    await Promise.all([
      client.prefetchQuery(['lead', id], getLead(id, token)),
      client.prefetchQuery(
        'users',
        getUsers({ shouldNotPaginate: true }, token),
      ),
    ])
  }

  return {
    notFound: investigate(client, ['lead', id]).isError,
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default LeadDetail
