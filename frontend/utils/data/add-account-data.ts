import { AccountType } from '@utils/models/account'
import { SectionTemplate } from './add-lead-data'

type AddAccountTemplate = SectionTemplate[]
export const AccountAddData: AddAccountTemplate = [
  {
    title: 'Account Information',
    items: [
      {
        name: 'Account Owner',
        id: 'ownerId',
        as: 'select',
        validation: {
          required: true,
        },
      },
      {
        name: 'Account Name',
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
        name: 'Account Type',
        id: 'type',
        as: 'select',
        validation: {
          required: true,
        },
        selectSource: Object.values(AccountType),
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
