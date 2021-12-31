import { LeadSource } from '@utils/models/lead'
import { SectionTemplate } from './update-lead-data'

type UpdateContactTemplate = SectionTemplate[]
export const ContactUpdateData: UpdateContactTemplate = [
  {
    title: 'Contact Information',
    items: [
      {
        label: 'Contact Owner',
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
        label: 'Email',
        name: 'email',
        type: 'email',
        required: true,
      },
      {
        label: 'Lead Source',
        name: 'source',
        as: 'select',
        required: true,
        selectSource: Object.values(LeadSource),
      },
      {
        label: 'Account',
        name: 'accountId',
        as: 'select',
        required: false,
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
