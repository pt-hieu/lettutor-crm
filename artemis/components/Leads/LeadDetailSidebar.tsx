import { notification } from 'antd'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import AddTaskModal, { TaskFormData } from '@utils/components/AddTaskModal'
import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import { useModal } from '@utils/hooks/useModal'
import { TaskStatus } from '@utils/models/task'
import { getLead } from '@utils/service/lead'
import { addTask } from '@utils/service/task'

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

  const { data: lead } = useQuery(['lead', leadId], getLead(leadId), {
    enabled: false,
  })

  const { open, close } = useMemo(
    () => ({
      open: lead?.tasks.filter((task) => task.status !== TaskStatus.COMPLETED)
        .length,
      close: lead?.tasks.filter((task) => task.status === TaskStatus.COMPLETED)
        .length,
    }),
    [lead],
  )

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
          id: LeadDetailSections.OpenActivities,
          label: (
            <span>
              {LeadDetailSections.OpenActivities}
              {!!open && (
                <span className="ml-3 bg-blue-600 text-white rounded-md p-1 px-2">
                  {open}
                </span>
              )}
            </span>
          ),
          extend: {
            title: 'Add A Task',
            onClick: () => openCreateTask(),
          },
        },
        {
          id: LeadDetailSections.ClosedActivities,
          label: (
            <span>
              {LeadDetailSections.ClosedActivities}
              {!!close && (
                <span className="ml-3 bg-blue-600 text-white rounded-md p-1 px-2">
                  {close}
                </span>
              )}
            </span>
          ),
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
