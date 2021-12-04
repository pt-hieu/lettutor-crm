import { emailReg } from 'pages/reset-password'
import { LeadSource, LeadStatus } from './models/lead'

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
  as?: 'select' | 'textarea' | 'input'
  validation?: Validation
  type?: 'email' | 'text'
  selectSource?: any[]
}

type SectionTemplate = {
  title: string
  col1?: Field[]
  col2?: Field[]
}

type AddLeadTemplate = SectionTemplate[]
export const LeadAddData: AddLeadTemplate = [
  {
    title: 'Lead Information',
    col1: [
      {
        name: 'Lead Owner',
        id: 'ownerId',
        as: 'select',
        validation: {
          required: true,
        },
        selectSource: ['Hao1', 'Hao2'],
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
    ],
    col2: [
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
        name: 'Lead Status',
        id: 'status',
        as: 'select',
        validation: {
          required: true,
        },
        selectSource: Object.values(LeadStatus),
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
    col1: [
      {
        name: 'Street',
        id: 'street',
      },
      {
        name: 'State',
        id: 'state',
      },
    ],
    col2: [
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
    col1: [
      {
        name: 'Description',
        id: 'description',
        as: 'textarea',
      },
    ],
  },
]
