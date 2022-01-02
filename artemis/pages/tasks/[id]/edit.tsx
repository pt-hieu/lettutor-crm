import { yupResolver } from '@hookform/resolvers/yup'
import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'
import { TaskAddData } from '@utils/data/add-task-data'
import { Field } from '@utils/data/update-deal-data'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Account } from '@utils/models/account'
import { Contact } from '@utils/models/contact'
import { Deal } from '@utils/models/deal'
import { Lead } from '@utils/models/lead'
import { Actions } from '@utils/models/role'
import { Task } from '@utils/models/task'
import { User } from '@utils/models/user'
import { getAccounts } from '@utils/service/account'
import { getContacts } from '@utils/service/contact'
import { getDeals } from '@utils/service/deal'
import { getLeads } from '@utils/service/lead'
import { getTask, updateTask } from '@utils/service/task'
import { getUsers } from '@utils/service/user'
import { notification, Select } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { dehydrate, QueryClient, useMutation, useQuery } from 'react-query'
import { TaskFormData, taskSchema } from '../add-task'

const { Option } = Select

const SelectKeys = ['leadContact', 'accountDeal'] as const

type SelectValue = {
  [key in typeof SelectKeys[number]]: string
}

type SelectChange = {
  [key in typeof SelectKeys[number]]: (value: string) => void
}

const LabelSelect = {
  leadContact: [
    {
      value: 'contactId',
      label: 'Contact',
    },
    {
      value: 'leadId',
      label: 'Lead',
    },
  ],
  accountDeal: [
    {
      value: 'accountId',
      label: 'Account',
    },
    {
      value: 'dealId',
      label: 'Deal',
    },
  ],
}

const CreateTask = () => {
  const { replace, query, push } = useRouter()
  const id = query.id as string

  const [leadOrContact, setLeadOrContact] = useState(
    LabelSelect.leadContact[0].value,
  )
  const [accountOrDeal, setAccountOrDeal] = useState(
    LabelSelect.accountDeal[0].value,
  )

  const valueSelect: SelectValue = {
    leadContact: leadOrContact,
    accountDeal: accountOrDeal,
  }

  const handleChangeSelect: SelectChange = {
    leadContact: (value: string) => setLeadOrContact(value),
    accountDeal: (value: string) => setAccountOrDeal(value),
  }

  const { data: task } = useQuery<Task>(['task', id], { enabled: false })

  const { data: taskOwners } = useQuery<User[]>(['users'], {
    enabled: false,
  })

  const { data: leads } = useQuery<Lead[]>(['leads'], {
    enabled: false,
  })

  const { data: contacts } = useQuery<Contact[]>(['contacts'], {
    enabled: false,
  })

  const { data: accounts } = useQuery<Account[]>(['accounts'], {
    enabled: false,
  })

  const { data: deals } = useQuery<Deal[]>(['deals'], {
    enabled: false,
  })

  const leadOptions = leads?.map((lead) => ({
    value: lead.id,
    option: lead.fullName,
  }))
  leadOptions?.unshift({ value: '', option: 'None' })

  const contactOptions = contacts?.map((contact) => ({
    value: contact.id,
    option: contact.fullName,
  }))
  contactOptions?.unshift({ value: '', option: 'None' })

  const accountOptions = accounts?.map((account) => ({
    value: account.id,
    option: account.fullName,
  }))
  accountOptions?.unshift({ value: '', option: 'None' })

  const dealOptions = deals?.map((deal) => ({
    value: deal.id,
    option: deal.fullName,
  }))
  dealOptions?.unshift({ value: '', option: 'None' })

  const selectChildren = {
    leadId: leadOptions?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.option}
      </option>
    )),
    contactId: contactOptions?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.option}
      </option>
    )),
    accountId: accountOptions?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.option}
      </option>
    )),
    dealId: dealOptions?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.option}
      </option>
    )),
  }

  const { isLoading, mutateAsync } = useMutation(
    ['update-task', id],
    updateTask(id),
    {
      onSuccess: () => {
        notification.success({
          message: 'Update task successfully.',
        })

        replace(`/tasks/${id}`)
      },
      onError: () => {
        notification.error({ message: 'Update task unsuccessfully.' })
      },
    },
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      accountId: task?.account?.id,
      contactId: task?.contact?.id,
      dealId: task?.deal?.id,
      description: task?.description,
      dueDate: task?.dueDate,
      leadId: task?.lead?.id,
      ownerId: task?.owner.id,
      priority: task?.priority,
      status: task?.status,
      subject: task?.subject,
    },
  })

  const submitTask = handleSubmit((data) => {
    const nullableKeys = ['leadId', 'contactId', 'accountId', 'dealId']
    nullableKeys.forEach((key) => {
      if (
        data[key as keyof typeof data] === '' ||
        (key !== leadOrContact && key !== accountOrDeal)
      ) {
        delete data[key as keyof typeof data]
      }
      if (leadOrContact === 'leadId') {
        key !== 'leadId' && delete data[key as keyof typeof data]
      }
    })
    if (!data.dueDate) {
      data.dueDate = null
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
      {Object.keys(LabelSelect).includes(name) ? (
        <div className="justify-self-end">
          <Select
            value={valueSelect[name as keyof typeof valueSelect]}
            className="w-[120px] text-right"
            bordered={false}
            suffixIcon={
              <i
                className={`fa fa-caret-down ${
                  name !== 'leadContact' && leadOrContact === 'leadId'
                    ? ''
                    : 'text-gray-500'
                }`}
              />
            }
            onChange={(value) =>
              handleChangeSelect[name as keyof typeof handleChangeSelect](value)
            }
            disabled={name === 'accountDeal' && leadOrContact === 'leadId'}
          >
            {LabelSelect[name as keyof typeof LabelSelect].map(
              ({ value, label }) => (
                <Option key={value} value={value}>
                  {label}
                </Option>
              ),
            )}
          </Select>
        </div>
      ) : (
        <label
          htmlFor={name}
          className={`mt-[10px] crm-label text-right ${
            required ? '' : "after:content-['']"
          }`}
        >
          {label}
        </label>
      )}

      <div className="col-span-2">
        {/* @ts-ignore */}
        <Input
          error={errors[name as keyof TaskFormData]?.message}
          as={as!}
          props={{
            disabled: name === 'accountDeal' && leadOrContact === 'leadId',
            type,
            className: `text-sm p-3 min-h-[44px] ${
              name === 'description' || name === 'address'
                ? 'w-[600px]'
                : 'w-full'
            }`,
            children:
              as === 'select' ? (
                name === 'ownerId' ? (
                  <>
                    {taskOwners?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </>
                ) : name in valueSelect ? (
                  <>
                    {
                      selectChildren[
                        valueSelect[
                          name as keyof typeof valueSelect
                        ] as keyof typeof selectChildren
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
            ...register(
              (name in valueSelect
                ? valueSelect[name as keyof typeof valueSelect]
                : name) as keyof TaskFormData,
            ),
          }}
        />
      </div>
    </div>
  )

  return (
    <Layout requireLogin title="CRM | Update Task">
      <div className="crm-container grid grid-cols-[1fr,180px] gap-4 pt-6">
        <div>
          {/* Lead Infomation Start */}
          {TaskAddData.map(({ title, items }) => (
            <div className="flex flex-col gap-6" key={title}>
              <h1 className="font-semibold text-lg text-gray-700">{title}</h1>

              <div className="grid grid-cols-2 gap-4">
                {items.map((field) => renderField(field))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end sticky top-[72px] gap-3 max-h-[40px]">
          <button className="crm-button-outline" onClick={() => push(`/tasks`)}>
            Cancel
          </button>
          <button
            className="crm-button"
            onClick={submitTask}
            disabled={isLoading}
          >
            <Loading on={isLoading}>Save</Loading>
          </button>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)
  const id = query.id as string

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
        ['leads'],
        getLeads({ shouldNotPaginate: true }, token),
      ),
      client.prefetchQuery(
        ['contacts'],
        getContacts({ shouldNotPaginate: true }, token),
      ),
      client.prefetchQuery(
        ['accounts'],
        getAccounts({ shouldNotPaginate: true }, token),
      ),
      client.prefetchQuery(
        ['deals'],
        getDeals({ shouldNotPaginate: true }, token),
      ),
      client.prefetchQuery(['task', id], getTask(id, token)),
    ])
  }

  return {
    notFound:
      investigate(client, ['task', id]).isError ||
      (await checkActionError(req, Actions.VIEW_AND_EDIT_ALL_TASK_DETAILS)),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default CreateTask
