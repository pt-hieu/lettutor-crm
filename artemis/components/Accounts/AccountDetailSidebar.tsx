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
import { getAccount } from '@utils/service/account'
import { addTask } from '@utils/service/task'

export enum AccountDetailSections {
  Notes = 'Notes',
  Deals = 'Deals',
  Logs = 'Logs',
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
  Attachments = 'Attachments',
}

const AccountDetailSidebar = () => {
  const router = useRouter()
  const accountId = router.query.id as string

  const client = useQueryClient()
  const [createTaskVisible, openCreateTask, closeCreateTask] = useModal()

  const { isLoading, mutateAsync } = useMutation('add-task', addTask, {
    onSuccess: () => {
      client.refetchQueries(['account', accountId])
      notification.success({
        message: 'Add task successfully.',
      })
    },
    onError: () => {
      notification.error({ message: 'Add task unsuccessfully.' })
    },
  })

  const { data: account } = useQuery(
    ['account', accountId],
    getAccount(accountId),
    { enabled: false },
  )

  const { open, close } = useMemo(
    () => ({
      open: account?.tasksToDisplay.filter(
        (task) => task.status !== TaskStatus.COMPLETED,
      ).length,
      close: account?.tasksToDisplay.filter(
        (task) => task.status === TaskStatus.COMPLETED,
      ).length,
    }),
    [account],
  )

  const createTask = (formData: TaskFormData) => {
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
          id: AccountDetailSections.OpenActivities,
          label: (
            <span>
              {AccountDetailSections.OpenActivities}
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
          id: AccountDetailSections.ClosedActivities,
          label: (
            <span>
              {AccountDetailSections.ClosedActivities}
              {!!close && (
                <span className="ml-3 bg-blue-600 text-white rounded-md p-1 px-2">
                  {close}
                </span>
              )}
            </span>
          ),
        },
        {
          id: AccountDetailSections.Attachments,
          label: (
            <span>
              {AccountDetailSections.Attachments}
              {!!account?.attachments.length && (
                <span className="ml-3 bg-blue-600 text-white rounded-md p-1 px-2">
                  {account.attachments.length}
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
          label: AccountDetailSections.Logs,
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
