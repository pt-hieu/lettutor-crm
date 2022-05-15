import { yupResolver } from '@hookform/resolvers/yup'
import { Divider, Modal, notification } from 'antd'
import { TaskFormData } from 'pages/tasks/create'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as yup from 'yup'

import Input from '@utils/components/Input'
import Loading from '@utils/components/Loading'
import { useTypedSession } from '@utils/hooks/useTypedSession'
import { TaskPriority, TaskStatus } from '@utils/models/task'
import { User } from '@utils/models/user'
import { addTask } from '@utils/service/task'
import { getRawUsers } from '@utils/service/user'

type Props = {
  visible: boolean
  handleClose: () => void
  moduleName: string
  entityId: string
}

const taskSchema = yup.object().shape({
  ownerId: yup.string().required('Task Owner is required.'),
  name: yup
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
  moduleName,
  entityId,
}: Props) => {
  const [session] = useTypedSession()

  const { data: taskOwners } = useQuery<Pick<User, 'name' | 'id'>[]>(
    ['users'],
    getRawUsers(),
  )

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: yupResolver(taskSchema),
  })

  const client = useQueryClient()

  const { isLoading, mutateAsync } = useMutation('add-task', addTask, {
    onSuccess: () => {
      client.refetchQueries([moduleName, entityId, 'tasks'])
      notification.success({
        message: 'Add task successfully.',
      })
      handleClose()
    },
    onError: () => {
      notification.error({ message: 'Add task unsuccessfully.' })
    },
  })

  const submit = useCallback(
    handleSubmit((data) => {
      data.entityIds = [entityId]
      if (!data.dueDate) delete data.dueDate

      mutateAsync(data)
    }),
    [entityId],
  )

  useEffect(() => {
    reset({ ownerId: session?.user.id })
  }, [session?.user.id, visible])

  return (
    <Modal
      visible={visible}
      onCancel={handleClose}
      centered
      destroyOnClose
      footer={
        <div className="flex w-full gap-2 justify-end">
          <button onClick={submit} disabled={isLoading} className="crm-button">
            <Loading on={isLoading}>Submit</Loading>
          </button>
          <button onClick={handleClose} className="crm-button-outline">
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
              error={errors.name?.message}
              props={{
                type: 'text',
                id: 'name',
                className: 'w-full',
                ...register('name'),
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="date" className="crm-label after:content-['']">
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
