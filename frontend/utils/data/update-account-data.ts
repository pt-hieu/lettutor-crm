import { AccountType } from '@utils/models/account'

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

type UpdateAccountTemplate = SectionTemplate[]
export const AccountUpdateData: UpdateAccountTemplate = [
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
        required: true,
      },
      {
        label: 'Account Type',
        name: 'type',
        as: 'select',
        selectSource: Object.values(AccountType),
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
