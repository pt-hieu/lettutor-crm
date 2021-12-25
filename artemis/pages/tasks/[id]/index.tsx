import TaskDetailNavbar from '@components/Tasks/TaskDetailNavbar'
import TaskDetailSidebar from '@components/Tasks/TaskDetailSidebar'
import Layout from '@utils/components/Layout'
import { getSessionToken } from '@utils/libs/getToken'
import { investigate } from '@utils/libs/investigate'
import { Task, TaskStatus } from '@utils/models/task'
import { getTask } from '@utils/service/task'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { ReactNode, useMemo } from 'react'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import { useModal } from '@utils/hooks/useModal'
import ConfirmCloseModal from '@components/Tasks/ConfirmCloseModal'

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

  const { data: task } = useQuery<Task>(['task', id])

  const taskInfo = useMemo(
    (): TaskInfo[] => [
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
    ],
    [task],
  )

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
      value: task?.account?.name,
    },
    {
      relative: Relatives.DEAL,
      value: task?.deal?.fullName,
    },
  ]

  relatives.forEach(({ relative, value }) => {
    if (task && task[relative]) {
      taskInfo.unshift({
        label: relative,
        value: value,
      })
    }
  })

  const isCompleted = task?.status === TaskStatus.COMPLETED

  const [visible, openConfirmModal, closeConfirmModal] = useModal()

  const confirmCloseTask = () => {
    console.log('confirm close task')
  }

  return (
    <Layout title={`CRM | Task | ${task?.subject}`} requireLogin>
      <ConfirmCloseModal
        visible={visible}
        onConfirmCloseTask={confirmCloseTask}
        onCloseModal={closeConfirmModal}
      />
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
                  <span className="text-lg text-green-500">Completed</span>
                ) : (
                  <button onClick={openConfirmModal} className="crm-button">
                    Close Task
                  </button>
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
    //notFound: investigate(client, ['task', id]).isError,
    props: {
      dehydratedState: dehydrate(client),
    },
  }
}

export default TaskDetail
