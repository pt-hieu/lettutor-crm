import { Task } from '@utils/models/task'
import moment from 'moment'
import Link from 'next/link'

type TaskProps = Pick<
  Task,
  'id' | 'subject' | 'dueDate' | 'owner' | 'status' | 'priority'
>

function TaskInfo(props: TaskProps) {
  const { id, subject, dueDate, owner, status, priority } = props
  return (
    <div className="pb-3">
      <Link href={`/tasks/${id}`}>
        <a className="font-semibold"> {subject} </a>
      </Link>
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
}

export default function TaskList({ tasks }: ListProps) {
  return (
    <>
      <h3 className="font-semibold text-[16px] text-gray-700">
        <i className="fa fa-tasks mr-4" />
        <span>Tasks</span>
        <span className="bg-blue-500 px-2 ml-4 text-white rounded-sm">
          {tasks.length}
        </span>
      </h3>
      <div className="flex flex-col gap-2">
        {tasks.map(({ id, subject, dueDate, owner, status, priority }) => (
          <TaskInfo
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
