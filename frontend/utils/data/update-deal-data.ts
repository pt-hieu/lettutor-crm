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

type UpdateDealTemplate = SectionTemplate[]
export const DealUpdateData: UpdateDealTemplate = [
  {
    title: 'Deal Information',
    items: [
      {
        label: 'Deal Owner',
        name: 'ownerId',
        as: 'select',
        selectSource: ['dummy1', 'dummy2'],
        required: true,
      },
      {
        label: 'Account name',
        name: 'accountId',
        as: 'select',
        selectSource: ['dummy1', 'dummy2'],
        required: true,
      },

      {
        label: 'Contact Name',
        name: 'contactId',
        as: 'select',
        selectSource: ['dummy1', 'dummy2'],
        required: false,
      },
      {
        label: 'Deal Name',
        name: 'name',
        required: true,
      },
      {
        label: 'Amount',
        name: 'amount',
        required: false,
      },
      {
        label: 'Closing Date',
        name: 'closingDate',
        required: true,
      },
      {
        label: 'Stage',
        name: 'stage',
        as: 'select',
        selectSource: ['dummy1', 'dummy2'],
        required: true,
      },
      {
        label: 'Lead Source',
        name: 'source',
        as: 'select',
        selectSource: ['dummy1', 'dummy2'],
        required: true,
      },
      {
        label: 'Probability',
        name: 'probability',
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
