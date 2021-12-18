import { LeadSource, LeadStatus } from '@utils/models/lead'
import { emailReg } from 'pages/reset-password'
import { SectionTemplate } from './add-lead-data'

type UpdateContactTemplate = SectionTemplate[]
export const ContactUpdateData: UpdateContactTemplate = [
  {
    title: 'Contact Information',
    items: [
      {
        name: 'Contact Owner',
        id: 'ownerId',
        as: 'select',
        validation: {
          required: true,
        },
      },
      {
        name: 'Full Name',
        id: 'fullName',
        validation: {
          required: true,
        },
      },

      {
        name: 'Phone',
        id: 'phoneNum',
        validation: {
          required: true,
          regExp: {
            value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
            message: 'Please enter a valid phone number',
          },
        },
      },
      {
        name: 'Email',
        id: 'email',
        type: 'email',
        validation: {
          required: true,
          regExp: {
            value: emailReg,
            message: 'Please enter a valid email address',
          },
        },
      },
      {
        name: 'Lead Source',
        id: 'source',
        as: 'select',
        validation: {
          required: true,
        },
        selectSource: Object.values(LeadSource),
      },
      {
        name: 'Account',
        id: 'accountId',
        as: 'select',
      },
    ],
  },
  {
    title: 'Address Information',
    items: [
      {
        name: 'Address',
        id: 'address',
        as: 'textarea',
      },
    ],
  },
  {
    title: 'Description Information',
    items: [
      {
        name: 'Description',
        id: 'description',
        as: 'textarea',
      },
    ],
  },
]
