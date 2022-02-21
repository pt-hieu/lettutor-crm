import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import AddTaskModal, { TaskFormData } from '@utils/components/AddTaskModal'
import { useRouter } from 'next/router'
import { useModal } from '@utils/hooks/useModal'
import { useMutation, useQueryClient } from 'react-query'
import { addTask } from '@utils/service/task'
import { notification } from 'antd'

export enum DealDetailSections {
  Notes = 'Notes',
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
}

const DealDetailSidebar = () => {
  const router = useRouter()
  const dealId = router.query.id as string

  const [createTaskVisible, openCreateTask, closeCreateTask] = useModal()

  const queryClient = useQueryClient()
  const { isLoading, mutateAsync } = useMutation('add-task', addTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(['deal', dealId])
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
      leadId: null,
      contactId: null,
      accountId: null,
      dealId,
    })

    closeCreateTask()
  }

  const SideBarItems: SidebarStructure = [
    {
      title: 'Related List',
      options: [
        {
          label: DealDetailSections.Notes,
        },
        {
          label: DealDetailSections.OpenActivities,
          choices: [
            {
              label: 'Task',
              onClick: () => openCreateTask(),
            },
          ],
        },
        {
          label: DealDetailSections.ClosedActivities,
        },
      ],
    },
  ]

  return (
    <>
      <AddTaskModal
        visible={createTaskVisible}
        handleClose={closeCreateTask}
        handleCreateTask={createTask}
        isLoading={isLoading}
      />
      <DetailPageSidebar data={SideBarItems} />
    </>
  )
}

export default DealDetailSidebar
