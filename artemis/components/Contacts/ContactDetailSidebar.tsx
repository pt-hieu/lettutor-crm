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

export enum ContactDetailSections {
  Notes = 'Notes',
  Deals = 'Deals',
  OpenActivities = 'Open Activities',
  ClosedActivities = 'Closed Activities',
}

const ContactDetailSidebar = () => {
  const router = useRouter()
  const contactId = router.query.id as string

  const [createTaskVisible, openCreateTask, closeCreateTask] = useModal()
  const { data: contact } = useQuery<Contact>(
    ['contact', contactId],
    getContact(contactId),
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
          label: ContactDetailSections.OpenActivities,
          choices: [
            {
              label: 'Task',
              onClick: () => openCreateTask(),
            },
          ],
        },
        {
          label: ContactDetailSections.ClosedActivities,
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
