import { notification } from 'antd'
import moment from 'moment'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from 'react-query'

import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useOwnership } from '@utils/hooks/useOwnership'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { Actions } from '@utils/models/role'
import { Task, TaskStatus } from '@utils/models/task'
import { closeTask } from '@utils/service/task'

import Confirm from './Confirm'

type TaskProps = Pick<
  Task,
  'id' | 'subject' | 'dueDate' | 'owner' | 'status' | 'priority'
> & {
  source: string
}

function TaskInfo(props: TaskProps) {
  const { id, subject, dueDate, owner, status, priority, source } = props

  const client = useQueryClient()
  const [session] = useTypedSession()

  const { query } = useRouter()
  const entityId = query.id as string

  const auth = useAuthorization()
  const isOwner = useOwnership(props as unknown as Task)

  const { mutateAsync, isLoading } = useMutation(
    ['close-task', id],
    closeTask(id, session?.user.id!),
    {
      onSuccess: () => {
        client.invalidateQueries([source, entityId])
        notification.success({
          message: 'Close task successfully.',
        })
      },
      onError: () => {
        notification.error({ message: 'Close task unsuccessfully.' })
      },
    },
  )

  return (
    <div className="pb-3">
      <div className="flex gap-4 group items-center">
        <Link href={`/tasks/${id}`}>
          <a className="font-semibold"> {subject} </a>
        </Link>

        {status !== TaskStatus.COMPLETED &&
          (auth[Actions.Task.VIEW_AND_EDIT_ALL_TASK_DETAILS] || isOwner) && (
            <Confirm
              message="Are you sure you want to close this task?"
              onYes={() => mutateAsync()}
            >
              <button
                disabled={isLoading}
                className="opacity-0 group-hover:opacity-100 crm-transition crm-button py-1"
              >
                <span className="fa fa-check mr-2" />
                Close
              </button>
            </Confirm>
          )}
      </div>

      <div className="text-[12px]">
        <p className="my-1">
          {dueDate ? moment(dueDate).format('DD/MM/YYYY') : 'No due date'}
        </p>

        <p className="m-0">
          <i className="fa fa-user text-gray-500 mr-1" /> {owner?.name}
        </p>
      </div>

      <div className="font-medium mt-3 flex flex-col gap-2">
        <div className="flex flex-row">
          <div className="text-gray-600 w-[100px]">Status</div>
          <div>
            <span className="pr-1">:</span> {status}
          </div>
        </div>

        <div className="flex flex-row">
          <div className="text-gray-600 w-[100px]">Priority</div>
          <div>
            <span className="pr-1">:</span> {priority}
          </div>
        </div>
      </div>
    </div>
  )
}

type ListProps = {
  tasks: Task[]
  source: string
}

export default function TaskList({ tasks, source }: ListProps) {
  return (
    <>
      <h3 className="font-semibold text-[16px] flex gap-4 items-center text-gray-700">
        <i className="fa fa-tasks" />
        <span>Tasks</span>

        <span className="bg-blue-600 px-2 text-white rounded-md">
          {tasks.length}
        </span>
      </h3>

      <div className="flex flex-col gap-2 mt-3">
        {tasks.map(({ id, subject, dueDate, owner, status, priority }) => (
          <TaskInfo
            source={source}
            key={id}
            id={id}
            subject={subject}
            dueDate={dueDate}
            owner={owner}
            status={status}
            priority={priority}
          />
        ))}
      </div>
    </>
  )
}
