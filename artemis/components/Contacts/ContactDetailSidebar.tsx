import { notification } from 'antd'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import AddTaskModal, { TaskFormData } from '@utils/components/AddTaskModal'
import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import { useModal } from '@utils/hooks/useModal'
import { Contact } from '@utils/models/contact'
import { TaskStatus } from '@utils/models/task'
import { getContact } from '@utils/service/contact'
import { addTask } from '@utils/service/task'

export enum ContactDetailSections {
  Notes = 'Notes',
  Deals = 'Deals',
  Logs = 'Logs',
  Attachments = 'Attachments',
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
}

const ContactDetailSidebar = () => {
  const router = useRouter()
  const contactId = router.query.id as string

  const [createTaskVisible, openCreateTask, closeCreateTask] = useModal()
  const { data: contact } = useQuery(
    ['contact', contactId],
    getContact(contactId),
    { enabled: false },
  )

  const client = useQueryClient()
  const { isLoading, mutateAsync } = useMutation('add-task', addTask, {
    onSuccess: () => {
      client.refetchQueries(['contact', contactId])
      notification.success({
        message: 'Add task successfully.',
      })
    },
    onError: () => {
      notification.error({ message: 'Add task unsuccessfully.' })
    },
  })

  const getAccountId = (contact: Contact | undefined) => {
    if (!contact) {
      return null
    }

    const isExistAccount = contact.account !== null

    if (isExistAccount) {
      return contact.account.id
    }

    return null
  }

  const createTask = async (formData: TaskFormData) => {
    if (!formData.dueDate) {
      formData.dueDate = null
    }

    mutateAsync({
      ...formData,
      leadId: null,
      contactId,
      accountId: getAccountId(contact),
      dealId: null,
    })

    closeCreateTask()
  }

  const { open, close } = useMemo(
    () => ({
      open: contact?.tasks.filter(
        (task) => task.status !== TaskStatus.COMPLETED,
      ).length,
      close: contact?.tasks.filter(
        (task) => task.status === TaskStatus.COMPLETED,
      ).length,
    }),
    [contact],
  )

  const SideBarItems: SidebarStructure = [
    {
      title: 'Related List',
      options: [
        {
          label: ContactDetailSections.Notes,
        },
        {
          label: ContactDetailSections.Deals,
        },
        {
          id: ContactDetailSections.OpenActivities,
          label: (
            <span>
              {ContactDetailSections.OpenActivities}
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
          id: ContactDetailSections.ClosedActivities,
          label: (
            <span>
              {ContactDetailSections.ClosedActivities}
              {!!close && (
                <span className="ml-3 bg-blue-600 text-white rounded-md p-1 px-2">
                  {close}
                </span>
              )}
            </span>
          ),
        },
        {
          label: ContactDetailSections.Attachments,
          extend: {
            title: 'Add attachments',
            onClick: () =>
              client.setQueryData('cmd:add-attachment', Date.now()),
          },
        },
        {
          label: ContactDetailSections.Logs,
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

export default ContactDetailSidebar
