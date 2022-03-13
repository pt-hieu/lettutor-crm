import { DealStage } from '@utils/models/deal'
import { LeadSource } from '@utils/models/lead'

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

type UpdateDealTemplate = SectionTemplate[]
export const DealUpdateData: UpdateDealTemplate = [
  {
    title: 'Deal Information',
    items: [
      {
        label: 'Deal Owner',
        name: 'ownerId',
        as: 'select',
        required: true,
      },
      {
        label: 'Account name',
        name: 'accountId',
        as: 'select',
        required: true,
      },
      {
        label: 'Contact Name',
        name: 'contactId',
        as: 'select',
        required: false,
      },
      {
        label: 'Deal Name',
        name: 'fullName',
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
        type: 'date',
        required: true,
      },
      {
        label: 'Stage',
        name: 'stageId',
        as: 'select',
        required: true,
      },
      {
        label: 'Lead Source',
        name: 'source',
        as: 'select',
        selectSource: Object.values(LeadSource),
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
