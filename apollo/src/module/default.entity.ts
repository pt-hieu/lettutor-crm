import { FieldType, Module } from './module.entity'

export enum LeadStatus {
  NONE = 'None',
  ATTEMPTED_TO_CONTACT = 'Attempted To Contact',
  CONTACT_IN_FUTURE = 'Contact In Future',
  CONTACTED = 'Contacted',
  JUNK_LEAD = 'Junk Lead',
  LOST_LEAD = 'Lost Lead',
  NOT_CONTACTED = 'Not Contacted',
  PRE_QUALIFIED = 'Pre Qualified',
  NOT_QUALIFIED = 'Not Qualified',
}

export enum LeadSource {
  NONE = 'None',
  FACEBOOK = 'Facebook',
  LET_TUTOR = 'Let Tutor',
  GOOGLE = 'Google',
}

export const deal: Pick<Module, 'name' | 'meta'> = {
  name: 'deal',
  meta: [
    {
      name: 'ownerId',
      group: 'Deal Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'User',
    },
    {
      name: 'accountId',
      group: 'Deal Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'Account',
    },
    {
      name: 'contactId',
      group: 'Deal Information',
      required: false,
      type: FieldType.RELATION,
      relateTo: 'Contact',
    },
    {
      name: 'fullName',
      group: 'Deal Information',
      required: true,
      type: FieldType.TEXT,
    },
    {
      name: 'amount',
      group: 'Deal Information',
      required: false,
      type: FieldType.NUMBER,
    },
    {
      name: 'closingDate',
      group: 'Deal Information',
      required: true,
      type: FieldType.TEXT,
    },
    {
      name: 'stageId',
      group: 'Deal Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'DealStage',
    },
    {
      name: 'accountId',
      group: 'Contact Information',
      required: false,
      type: FieldType.RELATION,
      relateTo: 'Account',
    },
    {
      name: 'source',
      group: 'Deal Information',
      required: true,
      type: FieldType.SELECT,
      options: Object.values(LeadSource),
    },
    {
      name: 'probability',
      group: 'Deal Information',
      required: false,
      type: FieldType.NUMBER,
    },
    {
      name: 'description',
      group: 'Description Information',
      required: true,
      type: FieldType.MULTILINE_TEXT,
    },
  ],
}

export const account: Pick<Module, 'name' | 'meta'> = {
  name: 'account',
  meta: [
    {
      name: 'ownerId',
      group: 'Account Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'User',
    },
    {
      name: 'fullName',
      group: 'Account Information',
      required: true,
      type: FieldType.TEXT,
    },
    {
      name: 'address',
      group: 'Address Information',
      required: true,
      type: FieldType.TEXT,
    },
    {
      name: 'phone',
      group: 'Account Information',
      required: true,
      type: FieldType.PHONE,
    },
    {
      name: 'description',
      group: 'Description Information',
      required: true,
      type: FieldType.MULTILINE_TEXT,
    },
  ],
}
export const contact: Pick<Module, 'name' | 'meta'> = {
  name: 'contact',
  meta: [
    {
      name: 'ownerId',
      group: 'Contact Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'User',
    },
    {
      name: 'fullName',
      group: 'Contact Information',
      required: true,
      type: FieldType.TEXT,
    },
    {
      name: 'phone',
      group: 'Contact Information',
      required: true,
      type: FieldType.PHONE,
    },
    {
      name: 'email',
      group: 'Contact Information',
      required: true,
      type: FieldType.EMAIL,
    },
    {
      name: 'source',
      group: 'Contact Information',
      required: true,
      type: FieldType.SELECT,
      options: Object.values(LeadSource),
    },
    {
      name: 'accountId',
      group: 'Contact Information',
      required: false,
      type: FieldType.RELATION,
      relateTo: 'Account',
    },
    {
      name: 'address',
      group: 'Address Information',
      required: true,
      type: FieldType.MULTILINE_TEXT,
    },
    {
      name: 'description',
      group: 'Description Information',
      required: true,
      type: FieldType.MULTILINE_TEXT,
    },
  ],
}

export const lead: Pick<Module, 'name' | 'meta'> = {
  name: 'lead',
  meta: [
    {
      name: 'ownerId',
      group: 'Lead Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'User',
    },
    {
      name: 'fullName',
      group: 'Lead Information',
      required: true,
      type: FieldType.TEXT,
    },
    {
      name: 'phoneNum',
      group: 'Lead Information',
      required: true,
      type: FieldType.PHONE,
    },
    {
      name: 'status',
      group: 'Lead Information',
      required: true,
      type: FieldType.SELECT,
      options: Object.values(LeadStatus),
    },
    {
      name: 'email',
      group: 'Lead Information',
      required: true,
      type: FieldType.EMAIL,
    },
    {
      name: 'source',
      group: 'Lead Information',
      required: true,
      type: FieldType.SELECT,
      options: Object.values(LeadSource),
    },

    {
      name: 'address',
      group: 'Address Information',
      required: false,
      type: FieldType.TEXT,
    },

    {
      name: 'description',
      group: 'Description Information',
      required: false,
      type: FieldType.MULTILINE_TEXT,
    },
  ],
}
