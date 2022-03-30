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

export enum AccountType {
  NONE = 'None',
  ANALYST = 'Analyst',
  COMPETITOR = 'Competitor',
  CUSTOMER = 'Customer',
  DISTRIBUTOR = 'Distributor',
  INTEGRATOR = 'Integrator',
  INVESTOR = 'Investor',
  OTHER = 'Other',
  PARTNER = 'Partner',
  PRESS = 'Press',
  PROSPECT = 'Prospect',
  RESELLER = 'Reseller',
  VENDOR = 'Vendor',
}

export enum ModuleName {
  LEAD = 'lead',
  CONTACT = 'contact',
  ACCOUNT = 'account',
  DEAL = 'deal',
}

export const deal: Pick<Module, 'name' | 'meta'> = {
  name: ModuleName.DEAL,
  meta: [
    {
      name: 'ownerId',
      group: 'Deal Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'user',
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'accountId',
      group: 'Deal Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'account',
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'contactId',
      group: 'Deal Information',
      required: false,
      type: FieldType.RELATION,
      relateTo: 'contact',
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'amount',
      group: 'Deal Information',
      required: false,
      type: FieldType.NUMBER,
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'closingDate',
      group: 'Deal Information',
      required: true,
      type: FieldType.TEXT,
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'stageId',
      group: 'Deal Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'dealstage',
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'source',
      group: 'Deal Information',
      required: true,
      type: FieldType.SELECT,
      options: Object.values(LeadSource),
      visibility: {
        Overview: false,
        Update: true,
      },
    },
    {
      name: 'probability',
      group: 'Deal Information',
      required: false,
      type: FieldType.NUMBER,
      visibility: {
        Overview: false,
        Update: true,
      },
    },
    {
      name: 'description',
      group: 'Description Information',
      required: false,
      type: FieldType.MULTILINE_TEXT,
      visibility: {
        Overview: false,
        Update: true,
      },
    },
  ],
}

export const account: Pick<Module, 'name' | 'meta'> = {
  name: ModuleName.ACCOUNT,
  meta: [
    {
      name: 'ownerId',
      group: 'Account Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'user',
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'phone',
      group: 'Account Information',
      required: true,
      type: FieldType.PHONE,
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'type',
      group: 'Account Information',
      required: true,
      type: FieldType.SELECT,
      options: Object.values(AccountType),
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'address',
      group: 'Address Information',
      required: false,
      type: FieldType.TEXT,
      visibility: {
        Overview: false,
        Update: true,
      },
    },
    {
      name: 'description',
      group: 'Description Information',
      required: false,
      type: FieldType.MULTILINE_TEXT,
      visibility: {
        Overview: false,
        Update: true,
      },
    },
  ],
}
export const contact: Pick<Module, 'name' | 'meta'> = {
  name: ModuleName.CONTACT,
  meta: [
    {
      name: 'ownerId',
      group: 'Contact Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'user',
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'phone',
      group: 'Contact Information',
      required: true,
      type: FieldType.PHONE,
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'email',
      group: 'Contact Information',
      required: true,
      type: FieldType.EMAIL,
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'source',
      group: 'Contact Information',
      required: true,
      type: FieldType.SELECT,
      options: Object.values(LeadSource),
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'accountId',
      group: 'Contact Information',
      required: false,
      type: FieldType.RELATION,
      relateTo: 'account',
      visibility: {
        Overview: false,
        Update: true,
      },
    },
    {
      name: 'address',
      group: 'Address Information',
      required: false,
      type: FieldType.MULTILINE_TEXT,
      visibility: {
        Overview: false,
        Update: true,
      },
    },
    {
      name: 'description',
      group: 'Description Information',
      required: false,
      type: FieldType.MULTILINE_TEXT,
      visibility: {
        Overview: false,
        Update: true,
      },
    },
  ],
}

export const lead: Pick<Module, 'name' | 'meta'> = {
  name: ModuleName.LEAD,
  meta: [
    {
      name: 'ownerId',
      group: 'Lead Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'user',
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'phone',
      group: 'Lead Information',
      required: true,
      type: FieldType.PHONE,
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'status',
      group: 'Lead Information',
      required: true,
      type: FieldType.SELECT,
      options: Object.values(LeadStatus),
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'email',
      group: 'Lead Information',
      required: true,
      type: FieldType.EMAIL,
      visibility: {
        Overview: true,
        Update: true,
      },
    },
    {
      name: 'source',
      group: 'Lead Information',
      required: true,
      type: FieldType.SELECT,
      options: Object.values(LeadSource),
      visibility: {
        Overview: true,
        Update: true,
      },
    },

    {
      name: 'address',
      group: 'Address Information',
      required: false,
      type: FieldType.TEXT,
      visibility: {
        Overview: false,
        Update: true,
      },
    },

    {
      name: 'description',
      group: 'Description Information',
      required: false,
      type: FieldType.MULTILINE_TEXT,
      visibility: {
        Overview: false,
        Update: true,
      },
    },
  ],
}
