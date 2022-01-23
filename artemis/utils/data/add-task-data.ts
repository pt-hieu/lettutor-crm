import { TaskPriority, TaskStatus } from '@utils/models/task'

export type Field = {
  label: string
  name: string
  as?: 'input' | 'select' | 'textarea'
  type?: 'email' | 'text' | 'date'
  selectSource?: any[]
  required: boolean
}

type SectionTemplate = {
  title: string
  items: Field[]
}

type AddTaskTemplate = SectionTemplate[]
export const TaskAddData: AddTaskTemplate = [
  {
    title: 'Task Information',
    items: [
      {
        label: 'Task Owner',
        name: 'ownerId',
        as: 'select',
        required: true,
      },
      {
        label: 'Subject',
        name: 'subject',
        required: true,
      },
      {
        label: 'Lead Contact',
        name: 'leadContact',
        as: 'select',
        required: true,
      },
      {
        label: 'Due Date',
        name: 'dueDate',
        type: 'date',
        required: false,
      },
      {
        label: 'Account Deal',
        name: 'accountDeal',
        as: 'select',
        required: false,
      },

      {
        label: 'Status',
        name: 'status',
        as: 'select',
        selectSource: Object.values(TaskStatus),
        required: true,
      },
      {
        label: 'Priority',
        name: 'priority',
        as: 'select',
        selectSource: Object.values(TaskPriority),
        required: true,
      },
    ],
  },
  {
    title: 'Description Information',
    items: [
      {
        label: 'Description',
        name: 'description',
        as: 'textarea',
        required: false,
      },
    ],
  },
]
