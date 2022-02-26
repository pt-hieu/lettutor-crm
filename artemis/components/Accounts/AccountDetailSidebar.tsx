import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import AddTaskModal, { TaskFormData } from '@utils/components/AddTaskModal'
import { useRouter } from 'next/router'
import { useModal } from '@utils/hooks/useModal'
import { useMutation, useQueryClient } from 'react-query'
import { addTask } from '@utils/service/task'
import { notification } from 'antd'

export enum AccountDetailSections {
  Notes = 'Notes',
  Deals = 'Deals',
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
}

const AccountDetailSidebar = () => {
  const router = useRouter()
  const accountId = router.query.id as string

  const [createTaskVisible, openCreateTask, closeCreateTask] = useModal()

  const queryClient = useQueryClient()
  const { isLoading, mutateAsync } = useMutation('add-task', addTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(['account', accountId])
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
      accountId,
      dealId: null,
    })

    closeCreateTask()
  }

  const SideBarItems: SidebarStructure = [
    {
      title: 'Related List',
      options: [
        {
          label: AccountDetailSections.Notes,
        },
        {
          label: AccountDetailSections.Deals,
        },
        {
          label: AccountDetailSections.OpenActivities,
          choices: [
            {
              label: 'Task',
              onClick: () => openCreateTask(),
            },
          ],
        },
        {
          label: AccountDetailSections.ClosedActivities,
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

export default AccountDetailSidebar
