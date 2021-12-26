import { useRouter } from 'next/router'

type Props = {
  subject: string
  id: string
}

const TaskDetailNavbar = ({ subject, id }: Props) => {
  const router = useRouter()
  const navigateToEditPage = () => {
    router.push(`/tasks/${id}/edit`)
  }
  return (
    <div className="mb-4 border-b pb-4 sticky top-[76px] bg-white z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <i className="fas fa-tasks mr-2 text-slate-500 text-lg"></i>
          <span className="font-semibold">{subject}</span>
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
