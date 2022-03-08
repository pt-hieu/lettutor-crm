import { yupResolver } from '@hookform/resolvers/yup'
import { notification } from 'antd'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { FieldErrors, UseFormRegister, useForm } from 'react-hook-form'
import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'

import LogSection from '@components/Logs/LogSection'
import TaskDetailNavbar from '@components/Tasks/TaskDetailNavbar'
import TaskDetailSidebar from '@components/Tasks/TaskDetailSidebar'

import Confirm from '@utils/components/Confirm'
import InlineEdit from '@utils/components/InlineEdit'
import { Props } from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import Tooltip from '@utils/components/Tooltip'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useOwnership, useServerSideOwnership } from '@utils/hooks/useOwnership'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { LogSource } from '@utils/models/log'
import { Actions } from '@utils/models/role'
import { Task, TaskPriority, TaskStatus } from '@utils/models/task'
import { User } from '@utils/models/user'
import { closeTask, getTask, updateTask } from '@utils/service/task'
import { getRawUsers } from '@utils/service/user'

import { TaskFormData, taskSchema } from '../add-task'

enum Relatives {
  LEAD = 'lead',
  CONTACT = 'contact',
  ACCOUNT = 'account',
  DEAL = 'deal',
}

type TaskInfo = {
  label: string
  props: Omit<Props<'input' | 'textarea' | 'select' | undefined>, 'editable'>
}

const fields = ({
  register,
  errors,
  users,
  disabled,
}: {
  register: UseFormRegister<TaskFormData>
  errors: FieldErrors<TaskFormData>
  users: User[]
  disabled?: boolean
}): Array<TaskInfo> => [
  {
    label: 'Task Owner',
    props: {
      as: 'select',
      error: errors.ownerId?.message,
      props: {
        disabled,
        children: (
          <>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </>
        ),
        id: 'owner',
        ...register('ownerId'),
      },
    },
  },
  {
    label: 'Subject',
    props: {
      error: errors.subject?.message,
      props: {
        disabled,
        type: 'text',
        id: 'subject',
        ...register('subject'),
      },
    },
  },
  {
    label: 'Due Date',
    props: {
      error: errors.dueDate?.message,
      props: {
        disabled,
        type: 'date',
        id: 'due-date',
        ...register('dueDate'),
      },
    },
  },
  {
    label: 'Status',
    props: {
      error: errors.status?.message,
      as: 'select',
      props: {
        disabled,
        id: 'status',
        children: (
          <>
            {Object.values(TaskStatus).map((status) => (
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
    label: 'Priority',
    props: {
      error: errors.priority?.message,
      as: 'select',
      props: {
        disabled,
        id: 'priority',
        children: (
          <>
            {Object.values(TaskPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </>
        ),
        ...register('priority'),
      },
    },
  },
  {
    label: 'Description',
    props: {
      error: errors.description?.message,
      props: {
        disabled,
        type: 'text',
        id: 'desc',
        ...register('description'),
      },
    },
  },
]

const TaskDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  const { data: users } = useQuery<User[]>('users', { enabled: false })
  const { data: task } = useQuery<Task>(['task', id], getTask(id))

  const isOwner = useOwnership(task)

  const relatives = [
    {
      relative: Relatives.LEAD,
      value: task?.lead?.fullName,
    },
    {
      relative: Relatives.CONTACT,
      value: task?.contact?.fullName,
    },
    {
      relative: Relatives.ACCOUNT,
      value: task?.account?.fullName,
    },
    {
      relative: Relatives.DEAL,
      value: task?.deal?.fullName,
    },
  ]

  const isCompleted = task?.status === TaskStatus.COMPLETED

  const queryClient = useQueryClient()
  const { mutateAsync } = useMutation(
    ['close-task', id],
    closeTask(id, task?.owner.id as string),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task', id])
        notification.success({
          message: 'Close task successfully.',
        })
      },
      onError: () => {
        notification.error({ message: 'Close task unsuccessfully.' })
      },
    },
  )

  const confirmCloseTask = () => {
    mutateAsync()
  }

  const defaultValues = useMemo(
    () => ({
      ownerId: task?.owner?.id,
      subject: task?.subject,
      dueDate: task?.dueDate,
      status: task?.status,
      priority: task?.priority,
      description: task?.description || '',
    }),
    [task],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    mode: 'onChange',
    resolver: yupResolver(taskSchema),
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues])

  const { mutateAsync: handleUpdateTask } = useMutation(
    ['update-task', id],
    updateTask(id),
    {
      onSuccess() {
        notification.success({ message: 'Update task successfully' })
        queryClient.invalidateQueries(['task', id])
        queryClient.refetchQueries([id, 'detail-log'])
      },
      onError() {
        notification.error({ message: 'Update task unsuccessfully' })
      },
    },
  )

  const auth = useAuthorization()

  const submit = useCallback(
    handleSubmit((data) => {
      if (!data.dueDate) {
        data.dueDate = null
      }
      handleUpdateTask(data)
    }),
    [id],
  )

  return (
    <Layout title={`CRM | Task | ${task?.subject}`} requireLogin>
      <div className="crm-container">
        <TaskDetailNavbar task={task!} />
        <div className="grid grid-cols-[250px,1fr]">
          <TaskDetailSidebar />
          <div className="flex flex-col divide-y gap-4">
            <div className="grid grid-cols-[8fr,2fr]">
              <div>
                <div>
                  <div className="font-semibold mb-4 text-[17px]">Overview</div>
                  <div className="flex flex-col gap-2">
                    {relatives.map(
                      ({ relative, value }) =>
                        task &&
                        task[relative] && (
                          <div
                            key={relative}
                            className="grid grid-cols-[250px,350px] gap-4 pb-[16px] hover:cursor-not-allowed"
                          >
                            <span className="inline-block text-right font-medium first-letter:uppercase">
                              {relative}
                            </span>
                            <span className="inline-block pl-3">{value}</span>
                          </div>
                        ),
                    )}
                  </div>

                  <div className="flex flex-col gap-4 divide-y">
                    <form onSubmit={submit} className="flex flex-col gap-2">
                      {fields({
                        register,
                        errors,
                        users: users || [],
                        disabled:
                          !auth[Actions.Task.VIEW_AND_EDIT_ALL_TASK_DETAILS] &&
                          !isOwner,
                      }).map(({ label, props }) => (
                        <div
                          key={label}
                          className="grid grid-cols-[250px,350px] gap-4"
                        >
                          <span className="inline-block text-right font-medium pt-[8px]">
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

                    <LogSection
                      source={LogSource.TASK}
                      entityId={id}
                      title="Logs"
                    />
                  </div>
                </div>
              </div>

              <div className="ml-auto">
                {isCompleted ? (
                  <Tooltip title="Completed">
                    <span className="crm-button bg-green-600 hover:bg-green-500">
                      <span className="fa fa-check" />
                    </span>
                  </Tooltip>
                ) : (
                  <>
                    {(auth[Actions.Task.VIEW_AND_EDIT_ALL_TASK_DETAILS] ||
                      isOwner) && (
                      <Confirm
                        message="Are you sure you want to mark this task as completed?"
                        title="Warning closing task"
                        onYes={confirmCloseTask}
                      >
                        <button className="crm-button">
                          <span className="fa fa-check mr-2" />
                          Close Task
                        </button>
                      </Confirm>
                    )}
                  </>
                )}
              </div>
            </div>
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
      client.prefetchQuery(['task', id], getTask(id, token)),
      client.prefetchQuery('users', getRawUsers(token)),
    ])
  }

  return {
    notFound:
      investigate(client, ['task', id]).isError ||
      ((await checkActionError(
        req,
        Actions.Task.VIEW_ALL_TASK_DETAILS,
        Actions.Task.VIEW_AND_EDIT_ALL_TASK_DETAILS,
      )) &&
        !(await useServerSideOwnership(req, client, ['task', id]))),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default TaskDetail
