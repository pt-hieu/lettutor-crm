import { notification } from 'antd'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'

import Confirm from '@utils/components/Confirm'
import TraceInfo from '@utils/components/TraceInfo'
import { useAuthorization } from '@utils/hooks/useAuthorization'
import { useOwnership } from '@utils/hooks/useOwnership'
import { Actions } from '@utils/models/role'
import { Task } from '@utils/models/task'
import { batchDelete } from '@utils/service/task'

type Props = {
  task: Task
}

const TaskDetailNavbar = ({ task }: Props) => {
  const { subject, id } = task
  const router = useRouter()
  const navigateToEditPage = () => {
    router.push(`/tasks/${id}/edit`)
  }

  const auth = useAuthorization()
  const isOwner = useOwnership(task)

  const { mutateAsync, isLoading: isDeleting } = useMutation(
    'delete-task',
    batchDelete,
    {
      onSuccess() {
        router.replace('/tasks')
        notification.success({ message: 'Delete task successfully' })
      },
      onError() {
        notification.error({ message: 'Delete task unsuccessfully' })
      },
    },
  )

  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-[999] transform translate-y-[-16px] crm-self-container">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <i className="fas fa-tasks mr-2 text-slate-500 text-lg"></i>
          <span className="font-semibold">{subject}</span>
          <TraceInfo entity={task} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(auth[Actions.Task.DELETE_TASK] || isOwner) && (
            <Confirm
              onYes={() => mutateAsync([id])}
              message="Are you sure you want to delete this task?"
            >
              <button disabled={isDeleting} className="crm-button-danger">
                <span className="fa fa-trash mr-2" />
                Delete
              </button>
            </Confirm>
          )}

          {(auth[Actions.Task.VIEW_AND_EDIT_ALL_TASK_DETAILS] || isOwner) && (
            <button
              className="crm-button-secondary"
              onClick={navigateToEditPage}
            >
              <span className="fa fa-edit mr-2" /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskDetailNavbar
