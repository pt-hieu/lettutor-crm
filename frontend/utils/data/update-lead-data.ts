import { LeadSource, LeadStatus } from '../models/lead'

export type Field = {
  label: string
  name: string
  as?: 'input' | 'select' | 'textarea'
  type?: 'email' | 'text'
  selectSource?: any[]
  required: boolean
}

type SectionTemplate = {
  title: string
  items: Field[]
}

type UpdateLeadTemplate = SectionTemplate[]
export const LeadUpdateData: UpdateLeadTemplate = [
  {
    title: 'Lead Information',
    items: [
      {
        label: 'Lead Owner',
        name: 'ownerId',
        as: 'select',
        required: true,
      },
      {
        label: 'Full Name',
        name: 'fullName',
        required: true,
      },
      {
        label: 'Phone',
        name: 'phoneNum',
        required: true,
      },
      {
        label: 'Lead Status',
        name: 'status',
        as: 'select',
        selectSource: Object.values(LeadStatus),
        required: true,
      },
      {
        label: 'Email',
        name: 'email',
        type: 'email',
        required: true,
      },

      {
        label: 'Lead Source',
        name: 'source',
        as: 'select',
        selectSource: Object.values(LeadSource),
        required: true,
      },
    ],
  },
  {
    title: 'Address Information',
    items: [
      {
        label: 'Address',
        name: 'address',
        as: 'textarea',
        required: false,
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
