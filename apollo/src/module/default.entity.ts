import { AggregateType, FieldType, Module, RelateType } from './module.entity'

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
  DEAL = 'deal',
  ACCOUNT = 'account',
  CONTACT = 'contact',
  LEAD = 'lead',
}

export const deal: Pick<
  Module,
  'name' | 'meta' | 'convert_meta' | 'kanban_meta'
> = {
  name: ModuleName.DEAL,
  convert_meta: [
    {
      source: ModuleName.LEAD,
      should_convert_attachment: true,
      should_convert_note: true,
      meta: {
        ownerId: 'ownerId',
        tasks: 'tasks',
      },
    },
  ],
  kanban_meta: {
    field: 'stageId',
    aggregate_type: AggregateType.SUM,
    aggregate_field: 'amount',
  },
  meta: [
    {
      name: 'ownerId',
      group: 'Deal Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'user',
      relateType: RelateType.SINGLE,
      visibility: {
        Overview: true,
        Update: true,
        Create: true,
      },
    },
    {
      name: 'accountId',
      group: 'Deal Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'account',
      relateType: RelateType.SINGLE,
      visibility: {
        Overview: true,
        Update: true,
        Create: true,
        Detail: true,
      },
    },
    {
      name: 'contactId',
      group: 'Deal Information',
      required: false,
      type: FieldType.RELATION,
      relateTo: 'contact',
      relateType: RelateType.SINGLE,
      visibility: {
        Overview: true,
        Update: true,
        Create: true,
        Detail: true,
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
        Create: true,
        Detail: true,
      },
    },
    {
      name: 'closingDate',
      group: 'Deal Information',
      required: true,
      type: FieldType.DATE,
      visibility: {
        Overview: true,
        Update: true,
        Create: true,
        Detail: true,
        Kanban: true,
      },
    },
    {
      name: 'stageId',
      group: 'Deal Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'dealstage',
      relateType: RelateType.SINGLE,
      visibility: {
        Overview: true,
        Update: true,
        Create: true,
        Detail: true,
      },
    },
    {
      name: 'source',
      group: 'Deal Information',
      required: true,
      type: FieldType.SELECT,
      options: Object.values(LeadSource),
      visibility: {
        Update: true,
        Create: true,
        Detail: true,
        Kanban: true,
      },
    },
    {
      name: 'probability',
      group: 'Deal Information',
      required: false,
      type: FieldType.NUMBER,
      visibility: {
        Update: true,
        Create: true,
        Detail: true,
        Kanban: true,
      },
    },
    {
      name: 'description',
      group: 'Description Information',
      required: false,
      type: FieldType.MULTILINE_TEXT,
      visibility: {
        Update: true,
        Create: true,
        Detail: true,
      },
      maxLength: 300,
      minLength: 0,
    },
    {
      name: 'tasks',
      group: 'Others',
      required: false,
      type: FieldType.RELATION,
      relateTo: 'task',
      relateType: RelateType.MULTIPLE,
      visibility: {},
    },
  ],
}

export const account: Pick<
  Module,
  'name' | 'meta' | 'convert_meta' | 'kanban_meta'
> = {
  name: ModuleName.ACCOUNT,
  convert_meta: [
    {
      source: ModuleName.LEAD,
      should_convert_attachment: true,
      should_convert_note: true,
      meta: {
        ownerId: 'ownerId',
        tasks: 'tasks',
      },
    },
  ],
  kanban_meta: {
    field: 'type',
  },
  meta: [
    {
      name: 'ownerId',
      group: 'Account Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'user',
      relateType: RelateType.SINGLE,
      visibility: {
        Overview: true,
        Update: true,
        Create: true,
        Detail: true,
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
        Create: true,
        Detail: true,
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
        Create: true,
        Detail: true,
      },
    },
    {
      name: 'address',
      group: 'Address Information',
      required: false,
      type: FieldType.TEXT,
      visibility: {
        Update: true,
        Create: true,
        Detail: true,
      },
      maxLength: 100,
      minLength: 0,
    },
    {
      name: 'description',
      group: 'Description Information',
      required: false,
      type: FieldType.MULTILINE_TEXT,
      visibility: {
        Update: true,
        Create: true,
        Detail: true,
      },
      maxLength: 300,
      minLength: 0,
    },
    {
      name: 'tasks',
      group: 'Others',
      required: false,
      type: FieldType.RELATION,
      relateTo: 'task',
      relateType: RelateType.MULTIPLE,
      visibility: {},
    },
  ],
}

export const contact: Pick<Module, 'name' | 'meta' | 'convert_meta'> = {
  name: ModuleName.CONTACT,
  convert_meta: [
    {
      source: ModuleName.LEAD,
      should_convert_attachment: true,
      should_convert_note: true,
      meta: {
        ownerId: 'ownerId',
        tasks: 'tasks',
      },
    },
  ],
  meta: [
    {
      name: 'ownerId',
      group: 'Contact Information',
      required: true,
      type: FieldType.RELATION,
      relateType: RelateType.SINGLE,
      relateTo: 'user',
      visibility: {
        Overview: true,
        Update: true,
        Create: true,
        Detail: true,
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
        Create: true,
        Detail: true,
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
        Create: true,
        Detail: true,
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
        Create: true,
        Detail: true,
      },
    },
    {
      name: 'accountId',
      group: 'Contact Information',
      required: false,
      type: FieldType.RELATION,
      relateTo: 'account',
      relateType: RelateType.SINGLE,
      visibility: {
        Update: true,
        Create: true,
        Detail: true,
      },
    },
    {
      name: 'address',
      group: 'Address Information',
      required: false,
      type: FieldType.MULTILINE_TEXT,
      visibility: {
        Create: true,
        Update: true,
        Detail: true,
      },
    },
    {
      name: 'description',
      group: 'Description Information',
      required: false,
      type: FieldType.MULTILINE_TEXT,
      visibility: {
        Update: true,
        Create: true,
        Detail: true,
      },
    },
    {
      name: 'tasks',
      group: 'Others',
      required: false,
      type: FieldType.RELATION,
      relateTo: 'task',
      relateType: RelateType.MULTIPLE,
      visibility: {},
    },
  ],
}

export const lead: Pick<Module, 'name' | 'meta' | 'convert_meta'> = {
  name: ModuleName.LEAD,
  convert_meta: [],
  meta: [
    {
      name: 'ownerId',
      group: 'Lead Information',
      required: true,
      type: FieldType.RELATION,
      relateTo: 'user',
      relateType: RelateType.SINGLE,
      visibility: {
        Overview: true,
        Update: true,
        Create: true,
        Detail: true,
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
        Create: true,
        Detail: true,
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
        Create: true,
        Detail: true,
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
        Create: true,
        Detail: true,
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
        Create: true,
        Detail: true,
      },
    },

    {
      name: 'address',
      group: 'Address Information',
      required: false,
      type: FieldType.TEXT,
      visibility: {
        Update: true,
        Create: true,
        Detail: true,
      },
      maxLength: 100,
      minLength: 0,
    },

    {
      name: 'description',
      group: 'Description Information',
      required: false,
      type: FieldType.MULTILINE_TEXT,
      visibility: {
        Update: true,
        Create: true,
        Detail: true,
      },
      maxLength: 300,
    },
    {
      name: 'tasks',
      group: 'Others',
      required: false,
      type: FieldType.RELATION,
      relateTo: 'task',
      relateType: RelateType.MULTIPLE,
      visibility: {},
    },
  ],
}
