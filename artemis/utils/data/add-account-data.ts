import { AccountType } from '@utils/models/account'
import { SectionTemplate } from './update-lead-data'

type AddAccountTemplate = SectionTemplate[]
export const AccountAddData: AddAccountTemplate = [
  {
    title: 'Account Information',
    items: [
      {
        label: 'Account Owner',
        name: 'ownerId',
        as: 'select',
        required: true,
      },
      {
        label: 'Account Name',
        name: 'fullName',
        required: true,
      },
      {
        label: 'Phone',
        name: 'phoneNum',
        required: false,
      },
      {
        label: 'Account Type',
        name: 'type',
        as: 'select',
        required: true,
        selectSource: Object.values(AccountType),
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
