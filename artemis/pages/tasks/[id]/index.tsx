import TaskDetailNavbar from '@components/Tasks/TaskDetailNavbar'
import TaskDetailSidebar from '@components/Tasks/TaskDetailSidebar'
import Layout from '@utils/components/Layout'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Task, TaskStatus } from '@utils/models/task'
import { closeTask, getTask } from '@utils/service/task'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { ReactNode, useMemo } from 'react'
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'
import { notification, Tooltip } from 'antd'
import Confirm from '@utils/components/Confirm'

type TaskInfo = {
  label: string
  value: ReactNode
}

enum Relatives {
  LEAD = 'lead',
  CONTACT = 'contact',
  ACCOUNT = 'account',
  DEAL = 'deal',
}

const TaskDetail = () => {
  const { query } = useRouter()
  const id = query.id as string

  const { data: task } = useQuery<Task>(['task', id], getTask(id))

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

  const taskInfo = useMemo((): TaskInfo[] => {
    const taskInfo = [
      {
        label: 'Owner',
        value: task?.owner.name,
      },
      {
        label: 'Subject',
        value: task?.subject,
      },
      {
        label: 'Due Date',
        value: task?.dueDate,
      },
      {
        label: 'Status',
        value: task?.status,
      },
      {
        label: 'Priority',
        value: task?.priority,
      },
      {
        label: 'Description',
        value: task?.description,
      },
    ]

    relatives.forEach(({ relative, value }) => {
      if (task && task[relative]) {
        taskInfo.unshift({
          label: relative.charAt(0).toUpperCase() + relative.slice(1),
          value: value,
        })
      }
    })

    return taskInfo
  }, [task])

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

  return (
    <Layout title={`CRM | Task | ${task?.subject}`} requireLogin>
      <div className="crm-container">
        <TaskDetailNavbar subject={task?.subject || ''} id={task?.id || ''} />

        <div className="grid grid-cols-[250px,1fr]">
          <TaskDetailSidebar />

          <div className="flex flex-col divide-y gap-4">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold mb-4 text-[17px]">Overview</div>
                <ul className="flex flex-col gap-4">
                  {taskInfo.map(({ label, value }) => (
                    <li
                      key={label}
                      className="grid grid-cols-[250px,1fr] gap-4"
                    >
                      <span className="inline-block text-right font-medium">
                        {label}
                      </span>
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                {isCompleted ? (
                  <Tooltip title="Completed">
                    <span className="crm-button bg-green-600 hover:bg-green-500">
                      <span className="fa fa-check" />
                    </span>
                  </Tooltip>
                ) : (
                  <Confirm
                    message="Are you sure you want to mark this task as completed?"
                    title="Warning closing task"
                    onYes={confirmCloseTask}
                  >
                    <button className="crm-button">Close Task</button>
                  </Confirm>
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
    await Promise.all([client.prefetchQuery(['task', id], getTask(id, token))])
  }

  return {
    notFound: investigate(client, ['task', id]).isError,
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default TaskDetail