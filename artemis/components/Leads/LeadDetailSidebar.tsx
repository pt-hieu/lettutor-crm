import { useModal } from '@utils/hooks/useModal'
import { notification } from 'antd'
import { addTask } from '@utils/service/task'

import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import { useMutation, useQueryClient } from 'react-query'
import { useRouter } from 'next/router'
import AddTaskModal, { TaskFormData } from '@utils/components/AddTaskModal'

export enum LeadDetailSections {
  Notes = 'Notes',
  Logs = 'Logs',
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
}

const LeadDetailSidebar = () => {
  const router = useRouter()
  const leadId = router.query.id as string

  const queryClient = useQueryClient()
  const { isLoading, mutateAsync } = useMutation('add-task', addTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(['lead', leadId])
      notification.success({
        message: 'Add task successfully.',
      })
    },
    onError: () => {
      notification.error({ message: 'Add task unsuccessfully.' })
    },
  })

  const createTask = async (formData: TaskFormData) => {
    if (!formData.dueDate) {
      formData.dueDate = null
    }

    mutateAsync({
      ...formData,
      leadId,
      contactId: null,
      accountId: null,
      dealId: null,
    })

    closeCreateTask()
  }

  const [createTaskVisible, openCreateTask, closeCreateTask] = useModal()

  const SideBarItems: SidebarStructure = [
    {
      title: 'Related List',
      options: [
        {
          label: LeadDetailSections.Notes,
        },
        {
          label: LeadDetailSections.Logs,
        },
        {
          label: LeadDetailSections.OpenActivities,
          choices: [
            {
              label: 'Task',
              onClick: () => openCreateTask(),
            },
          ],
        },
        {
          label: LeadDetailSections.ClosedActivities,
        },
      ],
    },
  ]

  return (
    <div className="relative">
      <AddTaskModal
        visible={createTaskVisible}
        handleClose={closeCreateTask}
        handleCreateTask={createTask}
        isLoading={isLoading}
      />
      <DetailPageSidebar data={SideBarItems} />
    </div>
  )
}

export default LeadDetailSidebar
