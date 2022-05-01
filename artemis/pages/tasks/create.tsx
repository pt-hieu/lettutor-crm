import { yupResolver } from '@hookform/resolvers/yup'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { QueryClient, dehydrate, useMutation, useQuery } from 'react-query'
import * as yup from 'yup'

import TaskAttachment from '@components/Tasks/TaskAttachment'

import Input from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import Loading from '@utils/components/Loading'
import SuggestInput from '@utils/components/SuggestInput'
import { getSessionToken } from '@utils/libs/getToken'
import { Task, TaskPriority, TaskStatus } from '@utils/models/task'
import { getEntityForTaskCreate } from '@utils/service/module'
import { addTask, updateTask } from '@utils/service/task'
import { getRawUsers } from '@utils/service/user'

export interface TaskFormData
  extends Pick<Task, 'name' | 'status' | 'priority' | 'description'> {
  ownerId: string
  entityIds: string[]
  dueDate?: Date
}

export const taskSchema = yup.object().shape({
  ownerId: yup.string().required('Owner is required.'),
  name: yup
    .string()
    .required('Name is required.')
    .max(100, 'Name must be at most 100 characters.'),
  status: yup.string().required('Status is required.'),
  priority: yup.string().required('Priority is required.'),
  description: yup
    .string()
    .max(500, 'Description must be at most 500 characters.'),
})

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const client = new QueryClient()
  const token = getSessionToken(req.cookies)

  await Promise.all([
    client.prefetchQuery('raw-users', getRawUsers(token)),
    client.prefetchQuery(
      'raw-entity-task-create',
      getEntityForTaskCreate(token),
    ),
  ])

  return {
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

type Props = {
  task?: Task
  entityIds?: string[]
}

const CreateTaskPage = ({ task, entityIds: initIds = [] }: Props) => {
  const { back, push } = useRouter()
  const form = useForm<TaskFormData>({
    resolver: yupResolver(taskSchema),
    // @ts-ignore
    defaultValues: {
      ...task,
      ownerId: task?.owner.id,
    },
  })

  useEffect(() => {
    // @ts-ignore
    form.reset({
      ...task,
      ownerId: task?.owner.id,
    })
  }, [task])

  const { mutateAsync, isLoading } = useMutation(
    'create-task',
    task ? updateTask(task.id) : addTask,
    {
      onSuccess(res) {
        notification.success({ message: 'Create task successfully' })
        push(`/tasks/${res.id}`)
      },
      onError() {
        notification.error({ message: 'Create task unsuccessfully' })
      },
    },
  )

  const [entityIds, setEntityIds] = useState<string[]>(initIds)
  const submit = useCallback(
    form.handleSubmit((data) => {
      data.entityIds = entityIds
      if (!data.dueDate) delete data.dueDate

      // @ts-ignore
      delete data.owner

      mutateAsync(data)
    }),
    [entityIds],
  )

  return (
    <Layout title={task ? `CRM | Update ${task.name}` : 'CRM | Create Task'}>
      <form
        noValidate
        onSubmit={submit}
        className="crm-container grid grid-cols-[1fr,200px] gap-4 pt-6"
      >
        <FormProvider {...form}>
          <div>
            <TaskInformation />
            <TaskAttachment entityIds={entityIds} setEntityIds={setEntityIds} />
            <TaskDescription />
          </div>
        </FormProvider>

        <div className="flex justify-end sticky top-[72px] gap-3 max-h-[40px]">
          <button type="button" className="crm-button-outline" onClick={back}>
            <span className="fa fa-times mr-2" />
            Cancel
          </button>

          <button disabled={isLoading} type="submit" className="crm-button">
            <Loading on={isLoading}>
              <span className="fa fa-check mr-2" />
              Submit
            </Loading>
          </button>
        </div>
      </form>
    </Layout>
  )
}

export default CreateTaskPage

function TaskDescription() {
  const {
    register,
    formState: { errors },
  } = useFormContext<TaskFormData>()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-semibold text-lg text-gray-700">
        Description Information
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-3 mb-6 gap-6">
          <label
            htmlFor="description"
            className="mt-[10px] crm-label text-right after:content-['']"
          >
            Description
          </label>

          <Input
            error={errors['description']?.message}
            as="textarea"
            props={{
              className: 'w-[600px]',
              id: 'description',
              ...register('description'),
            }}
          />
        </div>
      </div>
    </div>
  )
}

function TaskInformation() {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext<TaskFormData>()

  const { data: users } = useQuery('raw-users', getRawUsers(), {
    enabled: false,
  })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-semibold text-lg text-gray-700">Task Information</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-[1fr,2fr] mb-6 gap-6">
          <label htmlFor="name" className="mt-[10px] crm-label text-right">
            Name
          </label>

          <Input
            error={errors['name']?.message}
            props={{
              className: 'w-full',
              id: 'name',
              type: 'text',
              ...register('name'),
            }}
          />
        </div>

        <div className="grid grid-cols-[1fr,2fr] mb-6 gap-6">
          <label
            htmlFor="duedate"
            className="mt-[10px] crm-label text-right after:content-['']"
          >
            Due Date
          </label>

          <Input
            error={errors['dueDate']?.message}
            props={{
              className: 'w-full',
              id: 'duedate',
              type: 'date',
              ...register('dueDate'),
            }}
          />
        </div>

        <div className="grid grid-cols-[1fr,2fr] mb-6 gap-6">
          <label htmlFor="status" className="mt-[10px] crm-label text-right">
            Status
          </label>

          <SuggestInput
            wrapperClassname="!w-full"
            error={errors['status']?.message}
            inputProps={{
              className: 'w-full',
              id: 'status',
              ...register('status'),
            }}
            getData={Object.values(TaskStatus)}
            getKey={(u) => u}
            onItemSelect={(status) => setValue('status', status)}
            render={(u) => <span>{u}</span>}
            filter={(u, query) => u.toLocaleLowerCase().includes(query)}
          />
        </div>

        <div className="grid grid-cols-[1fr,2fr] mb-6 gap-6">
          <label htmlFor="prior" className="mt-[10px] crm-label text-right">
            Priority
          </label>

          <SuggestInput
            wrapperClassname="!w-full"
            error={errors['priority']?.message}
            inputProps={{
              className: 'w-full',
              id: 'prior',
              ...register('priority'),
            }}
            getData={Object.values(TaskPriority)}
            getKey={(u) => u}
            onItemSelect={(prior) => setValue('priority', prior)}
            render={(u) => <span>{u}</span>}
            filter={(u, query) => u.toLocaleLowerCase().includes(query)}
          />
        </div>

        <div className="grid grid-cols-[1fr,2fr] mb-6 gap-6">
          <label htmlFor="owner" className="mt-[10px] crm-label text-right">
            Owner
          </label>

          <SuggestInput
            wrapperClassname="!w-full"
            error={errors['ownerId']?.message}
            inputProps={{
              className: 'w-full',
              id: 'owner',
              ...register('ownerId'),
            }}
            getData={users || []}
            getKey={(u) => u.id}
            mapValue={(id, data) => data?.find((u) => u.id === id)?.name || ''}
            onItemSelect={({ id }) => setValue('ownerId', id)}
            render={(u) => <span>{u.name}</span>}
            filter={(u, query) => u.name.toLocaleLowerCase().includes(query)}
          />
        </div>
      </div>
    </div>
  )
}
