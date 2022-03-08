import { addTask } from '@utils/service/task'
import { notification } from 'antd'
import AddTaskModal, { TaskFormData } from '@utils/components/AddTaskModal'
import { useModal } from '@utils/hooks/useModal'
import DetailPageSidebar, {
  SidebarStructure,
} from '@utils/components/DetailPageSidebar'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useRouter } from 'next/router'
import { Contact } from '@utils/models/contact'
import { getContact } from '@utils/service/contact'
import { useMemo } from 'react'
import { TaskStatus } from '@utils/models/task'

export enum ContactDetailSections {
  Notes = 'Notes',
  Deals = 'Deals',
  Logs = 'Logs',
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

  const queryClient = useQueryClient()
  const { isLoading, mutateAsync } = useMutation('add-task', addTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(['contact', contactId])
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
          label: ContactDetailSections.Logs,
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
