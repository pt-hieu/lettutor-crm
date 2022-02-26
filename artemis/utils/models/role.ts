import { Base } from './base'
import { User } from './user'

export enum ActionScope {
  ADMIN = 'Admin',
  USER = 'User',
  ROLE = 'Role',
  LEAD = 'Lead',
  CONTACT = 'Contact',
  ACCOUNT = 'Account',
  DEAL = 'Deal',
  TASK = 'Task',
  NOTE = 'Note',
}

export const Actions = {
  [ActionScope.ADMIN]: {
    IS_ADMIN: 'Can do anything',
  } as const,

  [ActionScope.USER]: {
    VIEW_ALL_USERS: 'Can view all users',
    VIEW_ALL_USER_DETAILS: 'Can view any user details',
    VIEW_AND_EDIT_ALL_USER_STATUS: 'Can view and edit any user status',
    CREATE_NEW_USER: 'Can create new user',
  } as const,

  [ActionScope.ROLE]: {
    EDIT_ROLE: 'Can edit any roles',
    DELETE_ROLE: 'Can delete any roles',
    CREATE_NEW_ROLE: 'Can create new role',
    RESTORE_DEFAULT_ROLE: 'Can restore reserved role',
  } as const,

  [ActionScope.LEAD]: {
    VIEW_ALL_LEADS: 'Can view all leads',
    VIEW_ALL_LEAD_DETAILS: 'Can view any lead details',
    VIEW_AND_EDIT_ALL_LEAD_DETAILS: 'Can view and edit any lead details',
    CREATE_NEW_LEAD: 'Can create new lead',
    VIEW_AND_CONVERT_LEAD_DETAILS: 'Can convert any leads',
    DELETE_LEAD: 'Can delete any leads',
  } as const,

  [ActionScope.CONTACT]: {
    VIEW_ALL_CONTACTS: 'Can view all contacts',
    VIEW_ALL_CONTACT_DETAILS: 'Can view any contact details',
    VIEW_AND_EDIT_ALL_CONTACT_DETAILS: 'Can view and edit any contact details',
    CREATE_NEW_CONTACT: 'Can create new contacts',
    DELETE_CONTACT: 'Can delete any contact',
  } as const,

  [ActionScope.ACCOUNT]: {
    VIEW_ALL_ACCOUNTS: 'Can view all accounts',
    VIEW_ALL_ACCOUNT_DETAILS: 'Can view any account details',
    VIEW_AND_EDIT_ALL_ACCOUNT_DETAILS: 'Can view and edit any account details',
    CREATE_NEW_ACCOUNT: 'Can create new account',
    DELETE_ACCOUNT: 'Can delete any account',
  } as const,

  [ActionScope.DEAL]: {
    VIEW_ALL_DEALS: 'Can view all deals',
    VIEW_ALL_DEAL_DETAILS: 'Can view any deal details',
    VIEW_AND_EDIT_ALL_DEAL_DETAILS: 'Can view and edit any deal details',
    CREATE_NEW_DEAL: 'Can create new deal',
    DELETE_DEAL: 'Can delete any deal',
  } as const,

  [ActionScope.TASK]: {
    VIEW_ALL_TASKS: 'Can view all tasks',
    VIEW_ALL_TASK_DETAILS: 'Can view any task details',
    VIEW_AND_EDIT_ALL_TASK_DETAILS: 'Can view and edit any task details',
    CREATE_NEW_TASK: 'Can create new task',
    CLOSE_TASK: 'Can close any task',
    DELETE_TASK: 'Can detele any task',
  } as const,

  [ActionScope.NOTE]: {
    VIEW_ALL_NOTES: 'Can view all notes',
    CREATE_NEW_NOTE: 'Can create new note',
    DELETE_NOTE: 'Can delete any note',
  } as const,
}

export type Actions = typeof Actions[keyof typeof Actions]

type Values<T> = T extends T ? T[keyof T] : never
export type ActionValues = Values<Actions>

export interface Role extends Base {
  name: string
  actions: ActionValues[]
  parent: Role
  children: Role[]
  users: User[]
  usersCount?: number
  default: boolean
}
