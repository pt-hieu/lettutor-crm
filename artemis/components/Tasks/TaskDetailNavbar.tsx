import TraceInfo from '@utils/components/TraceInfo'
import { Task } from '@utils/models/task'
import { useRouter } from 'next/router'

type Props = {
  task: Task
}

const TaskDetailNavbar = ({ task }: Props) => {
  const { subject, id } = task
  const router = useRouter()
  const navigateToEditPage = () => {
    router.push(`/tasks/${id}/edit`)
  }
  return (
    <div className="mb-4 border-b py-4 sticky top-[76px] bg-white z-10 transform translate-y-[-16px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <i className="fas fa-tasks mr-2 text-slate-500 text-lg"></i>
          <span className="font-semibold">{subject}</span>
          <TraceInfo entity={task} />
        </div>

        <div className="flex flex-row gap-3">
          <button className="crm-button-secondary" onClick={navigateToEditPage}>
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailNavbar
