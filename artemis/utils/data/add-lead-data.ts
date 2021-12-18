import { emailReg } from 'pages/reset-password'
import { LeadSource, LeadStatus } from '../models/lead'

type Validation = {
  required?: boolean
  regExp?: {
    value: RegExp
    message: string
  }
}

export type Field = {
  name: string
  id: string
  as?: 'input' | 'select' | 'textarea'
  validation?: Validation
  type?: 'email' | 'text'
  selectSource?: any[]
}

export type SectionTemplate = {
  title: string
  items: Field[]
}

type AddLeadTemplate = SectionTemplate[]
export const LeadAddData: AddLeadTemplate = [
  {
    title: 'Lead Information',
    items: [
      {
        name: 'Lead Owner',
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
        name: 'Lead Status',
        id: 'status',
        as: 'select',
        validation: {
          required: true,
        },
        selectSource: Object.values(LeadStatus),
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
    ],
  },
  {
    title: 'Address Information',
    items: [
      {
        name: 'Street',
        id: 'street',
      },
      {
        name: 'State',
        id: 'state',
      },
      {
        name: 'City',
        id: 'city',
      },
      {
        name: 'Country',
        id: 'country',
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
