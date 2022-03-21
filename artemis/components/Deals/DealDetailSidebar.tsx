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
import { getDeal } from '@utils/service/deal'
import { addTask } from '@utils/service/task'

export enum DealDetailSections {
  Notes = 'Notes',
  Logs = 'Logs',
  Attachments = 'Attachments',
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
}

const DealDetailSidebar = () => {
  const router = useRouter()
  const dealId = router.query.id as string

  const [createTaskVisible, openCreateTask, closeCreateTask] = useModal()

  const client = useQueryClient()
  const { isLoading, mutateAsync } = useMutation('add-task', addTask, {
    onSuccess: () => {
      client.refetchQueries(['deal', dealId])
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

  const { data: deal } = useQuery(['deal', dealId], getDeal(dealId), {
    enabled: false,
  })

  const { open, close } = useMemo(
    () => ({
      open: deal?.tasks.filter((task) => task.status !== TaskStatus.COMPLETED)
        .length,
      close: deal?.tasks.filter((task) => task.status === TaskStatus.COMPLETED)
        .length,
    }),
    [deal],
  )

  const SideBarItems: SidebarStructure = [
    {
      title: 'Related List',
      options: [
        {
          label: DealDetailSections.Notes,
        },
        {
          id: DealDetailSections.OpenActivities,
          label: (
            <span>
              {DealDetailSections.OpenActivities}
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
          id: DealDetailSections.ClosedActivities,
          label: (
            <span>
              {DealDetailSections.ClosedActivities}
              {!!close && (
                <span className="ml-3 bg-blue-600 text-white rounded-md p-1 px-2">
                  {close}
                </span>
              )}
            </span>
          ),
        },
        {
          id: DealDetailSections.Attachments,
          label: (
            <span>
              {DealDetailSections.Attachments}
              {!!deal?.attachments.length && (
                <span className="ml-3 bg-blue-600 text-white rounded-md p-1 px-2">
                  {deal.attachments.length}
                </span>
              )}
            </span>
          ),
          extend: {
            title: 'Add attachments',
            onClick: () =>
              client.setQueryData('cmd:add-attachment', Date.now()),
          },
        },
        {
          label: DealDetailSections.Logs,
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

export default DealDetailSidebar
