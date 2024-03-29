import { yupResolver } from '@hookform/resolvers/yup'
import { Divider, notification } from 'antd'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldErrors, UseFormRegister, useForm } from 'react-hook-form'
import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'

import { Sections } from '@components/Details/Sidebar'
import LogSection from '@components/Logs/LogSection'
import { INoteData } from '@components/Notes/NoteAdder'
import { DEFAULT_NUM_NOTE, NoteSection } from '@components/Notes/NoteSection'
import TaskDetailNavbar from '@components/Tasks/TaskDetailNavbar'
import TaskDetailSidebar from '@components/Tasks/TaskDetailSidebar'

import AttachmentSection from '@utils/components/AttachmentSection'
import Confirm from '@utils/components/Confirm'
import InlineEdit from '@utils/components/InlineEdit'
import { Props } from '@utils/components/Input'
import Layout from '@utils/components/Layout'
import Tooltip from '@utils/components/Tooltip'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useOwnership, useServerSideOwnership } from '@utils/hooks/useOwnership'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { checkActionError } from '@utils/libs/checkActions'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { DefaultSource } from '@utils/models/log'
import { AddNoteDto } from '@utils/models/note'
import { ActionType, DefaultModule } from '@utils/models/role'
import { Task, TaskPriority, TaskStatus } from '@utils/models/task'
import { User } from '@utils/models/user'
import { getNotes } from '@utils/service/note'
import {
  closeTask,
  getRelation,
  getTask,
  updateTask,
} from '@utils/service/task'
import { getRawUsers } from '@utils/service/user'

import { TaskFormData, taskSchema } from '../create'

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
    label: 'Name',
    props: {
      error: errors.name?.message,
      props: {
        disabled,
        type: 'text',
        id: 'subject',
        ...register('name'),
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
      as: 'textarea',
      props: {
        disabled,
        id: 'desc',
        cols: 40,
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
  const isCompleted = task?.status === TaskStatus.COMPLETED
  const auth = useAuthorization()

  const queryClient = useQueryClient()
  const { mutateAsync } = useMutation(
    ['close-task', id],
    closeTask(id, task?.owner.id as string),
    {
      onSuccess: () => {
        queryClient.refetchQueries(['task', id])
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
      name: task?.name,
      dueDate: task?.dueDate || undefined,
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
        queryClient.refetchQueries(['task', id])
        queryClient.refetchQueries([id, 'detail-log'])
      },
      onError() {
        notification.error({ message: 'Update task unsuccessfully' })
      },
    },
  )

  const submit = useCallback(
    handleSubmit((data) => {
      if (!data.dueDate) {
        delete data.dueDate
      }
      handleUpdateTask(data)
    }),
    [id],
  )

  const { data: relations } = useQuery(
    ['task', id, 'relations'],
    getRelation(id),
    {
      enabled: false,
    },
  )

  return (
    <Layout title={`CRM | Task | ${task?.name}`} requireLogin>
      <div className="crm-container">
        <TaskDetailNavbar task={task!} />
        <div className="grid grid-cols-[250px,1fr]">
          <TaskDetailSidebar />
          <div className="flex flex-col divide-y gap-4">
            <div className="grid grid-cols-[8fr,2fr]">
              <div>
                <div className="font-semibold mb-4 text-[17px]">Overview</div>

                <div className="flex flex-col gap-4">
                  <form onSubmit={submit} className="flex flex-col gap-2">
                    {fields({
                      register,
                      errors,
                      users: users || [],
                      disabled:
                        !auth(
                          ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY,
                          DefaultModule.TASK,
                        ) && !isOwner,
                    }).map(({ label, props }) => (
                      <div
                        key={label}
                        className="grid grid-cols-[250px,350px] gap-4"
                      >
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

                  <Divider />

                  <div>
                    <div className="font-semibold mb-4 text-[17px]">
                      Relations
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,250px))] gap-2">
                      {relations?.map(
                        ({ name, id, module: { name: moduleName } }) => (
                          <Link
                            key={id}
                            href={{
                              pathname: '/[...path]',
                              query: { path: [moduleName, id] },
                            }}
                          >
                            <a className="min-h-[80px] border rounded-md px-3 hover:shadow-md crm-transition grid place-content-center hover:text-current">
                              <div>
                                <span className="font-medium capitalize">
                                  {moduleName}:
                                </span>{' '}
                                {name}
                              </div>
                            </a>
                          </Link>
                        ),
                      )}
                    </div>
                  </div>

                  <Divider />

                  <NoteSection
                    id={Sections.Notes}
                    moduleName={'task'}
                    entityId={id}
                    hasFilter={false}
                  />

                  <AttachmentSection
                    moduleName={'task'}
                    entityId={id}
                    id={Sections.Attachments}
                    data={task?.attachments}
                  />

                  <LogSection
                    source={DefaultSource.TASK}
                    entityId={id}
                    title="Logs"
                  />
                </div>
              </div>

              <div className="ml-auto">
                {isCompleted ? (
                  <Tooltip offset={146} title="Completed">
                    <span className="crm-button bg-green-600 hover:bg-green-500">
                      <span className="fa fa-check" />
                    </span>
                  </Tooltip>
                ) : (
                  <>
                    {(true || isOwner) && (
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
      client.prefetchQuery(['task', id, 'relations'], getRelation(id, token)),
      client.prefetchQuery('users', getRawUsers(token)),
      client.prefetchQuery(
        ['task', id, 'notes', 'first', false],
        getNotes(
          {
            source: 'task',
            sourceId: id,
            sort: 'first',
            shouldNotPaginate: false,
            nTopRecent: DEFAULT_NUM_NOTE,
          },
          token,
        ),
      ),
    ])
  }

  return {
    notFound: investigate(client, ['task', id]).isError,
    // ((await checkActionError(
    //   req,
    //   Actions.Task.VIEW_ALL_TASK_DETAILS,
    //   Actions.Task.VIEW_AND_EDIT_ALL_TASK_DETAILS,
    // )) &&
    //   !(await useServerSideOwnership(req, client, ['task', id]))),
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default TaskDetail
