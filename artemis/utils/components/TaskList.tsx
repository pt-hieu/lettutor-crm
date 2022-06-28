import { notification } from 'antd'
import moment from 'moment'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'

import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useOwnership } from '@utils/hooks/useOwnership'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { ActionType, DefaultModule } from '@utils/models/role'
import { Task, TaskStatus } from '@utils/models/task'
import { closeTask } from '@utils/service/task'

import Confirm from './Confirm'

type TaskProps = Task & {
  onCloseTask: () => void
}

function TaskInfo(props: TaskProps) {
  const {
    id,
    name,
    dueDate,
    owner,
    status,
    priority,
    onCloseTask: refetchTasks,
  } = props

  const [session] = useTypedSession()

  const { query } = useRouter()

  const auth = useAuthorization()
  const isOwner = useOwnership(props as unknown as Task)

  const { mutateAsync, isLoading } = useMutation(
    ['close-task', id],
    closeTask(id, session?.user.id!),
    {
      onSuccess: () => {
        refetchTasks()
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
    <div className="pb-3 group">
      <div className="flex gap-4 items-center">
        <Link href={`/tasks/${id}`}>
          <a className="font-semibold"> {name} </a>
        </Link>

        {status !== TaskStatus.COMPLETED &&
          (auth(ActionType.CAN_VIEW_DETAIL_AND_EDIT_ANY, DefaultModule.TASK) ||
            isOwner) && (
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
  onCloseTask: () => void
}

export default function TaskList({
  tasks,
  onCloseTask: refetchTasks,
}: ListProps) {
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
        {tasks.map((task) => (
          <TaskInfo onCloseTask={refetchTasks} key={task.id} {...task} />
        ))}
      </div>
    </>
  )
}
