import { Modal, Divider } from 'antd'
import Loading from '@utils/components/Loading'
import Input from '@utils/components/Input'
import { Task, TaskPriority, TaskStatus } from '@utils/models/task'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { User } from '@utils/models/user'

export interface TaskFormData
  extends Pick<
    Task,
    'subject' | 'dueDate' | 'status' | 'priority' | 'description'
  > {
  ownerId: string
}

type Props = {
  visible: boolean
  handleClose: () => void
  handleCreateTask: (data: TaskFormData) => void
  isLoading: boolean
}

const taskSchema = yup.object().shape({
  ownerId: yup.string().required('Task Owner is required.'),
  subject: yup
    .string()
    .required('Subject is required.')
    .max(100, 'Subject must be at most 100 characters.'),
  status: yup.string().required('Status is required.'),
  priority: yup.string().required('Priority is required.'),
  description: yup
    .string()
    .max(500, 'Description must be at most 500 characters.'),
})

const AddTaskModal = ({
  visible,
  handleClose,
  handleCreateTask,
  isLoading,
}: Props) => {
  const [session] = useTypedSession()

  const { data: taskOwners } = useQuery<User[]>(['users'], { enabled: false })

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      ownerId: '',
      description: '',
      dueDate: null,
    },
  })

  const createTask = handleSubmit(handleCreateTask)
  const closeModal = () => {
    handleClose()
    reset()
  }

  useEffect(() => {
    setValue('ownerId', session?.user.id || '')
  }, [session?.user.id])

  return (
    <Modal
      visible={visible}
      onCancel={closeModal}
      centered
      footer={
        <div className="flex w-full gap-2 justify-end">
          <button
            onClick={createTask}
            disabled={isLoading}
            className="crm-button"
          >
            <Loading on={isLoading}>Submit</Loading>
          </button>
          <button onClick={closeModal} className="crm-button-outline">
            Cancel
          </button>
        </div>
      }
    >
      <div className="flex gap-2 items-center">
        <div className="font-medium text-[17px]">Create Task</div>
      </div>

      <Divider />

      <div className="max-h-[400px] overflow-y-auto overflow-x-hidden crm-scrollbar pr-2">
        <form className="rounded-md p-4">
          <div className="mb-4">
            <label htmlFor="ownerId" className="crm-label">
              Owner
            </label>
            <Input
              error={errors.ownerId?.message}
              as="select"
              props={{
                id: 'ownerId',
                className: 'w-full',
                ...register('ownerId'),
                children: (
                  <>
                    {taskOwners?.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name}
                      </option>
                    ))}
                  </>
                ),
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="subject" className="crm-label">
              Subject
            </label>
            <Input
              error={errors.subject?.message}
              props={{
                type: 'text',
                id: 'name',
                className: 'w-full',
                ...register('subject'),
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="date" className="crm-label">
              Due Date
            </label>
            <Input
              error={errors.dueDate?.message}
              props={{
                type: 'date',
                id: 'date',
                className: 'w-full',
                ...register('dueDate'),
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="status" className="crm-label">
              Status
            </label>
            <Input
              error={errors.status?.message}
              as="select"
              props={{
                id: 'status',
                className: 'w-full',
                ...register('status'),
                children: (
                  <>
                    {Object.values(TaskStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </>
                ),
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="priority" className="crm-label">
              Priority
            </label>
            <Input
              error={errors.priority?.message}
              as="select"
              props={{
                id: 'priority',
                className: 'w-full',
                ...register('priority'),
                children: (
                  <>
                    {Object.values(TaskPriority).map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </>
                ),
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="crm-label-optional">
              Description
            </label>
            <Input
              error={errors.description?.message}
              as="textarea"
              props={{
                id: 'description',
                className: 'w-full',
                ...register('description'),
              }}
            />
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AddTaskModal
