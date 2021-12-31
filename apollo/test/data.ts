import { Account, AccountType } from 'src/account/account.entity'
import { Deal, DealStage } from 'src/deal/deal.entity'
import { Lead, LeadSource, LeadStatus } from 'src/lead/lead.entity'
import { Actions } from 'src/type/action'
import { Role, User, UserStatus } from 'src/user/user.entity'
import { Task, TaskPriority, TaskStatus } from 'src/task/task.entity'
import { Contact } from 'src/contact/contact.entity'

export const role: Role = {
  actions: [Actions.IS_ADMIN],
  name: 'Admin',
  children: [],
  id: '24',
  childrenIds: [],
  parent: null,
  users: [],
  createdAt: null,
  updatedAt: null,
  createdBy: null,
  updatedBy: null,
  createdById: null,
  updatedById: null,
}

export const user: User = {
  email: 'admin@mail.com',
  id: '123',
  name: 'admin',
  password: '$2b$10$CpcAGVAZ4uoVj1QOj3p99OhY5kTwYgi7JwbVYIpYganM.ZT6Bf1De',
  passwordToken: '1232',
  status: UserStatus.ACTIVE,
  tokenExpiration: null,
  createdAt: null,
  updatedAt: null,
  leads: [],
  contacts: [],
  roles: [role],
  accounts: [],
  deals: [],
  createdBy: null,
  updatedBy: null,
  tasks: [],
  createdById: null,
  updatedById: null,
}

export const lead: Lead = {
  id: '1234',
  owner: user,
  ownerId: user.id,
  account: null,
  accountId: null,
  fullName: 'lead',
  email: 'lead@mail.com',
  status: LeadStatus.NONE,
  source: LeadSource.NONE,
  address: null,
  description: null,
  phoneNum: null,
  socialAccount: null,
  createdAt: null,
  updatedAt: null,
  deals: [],
  createdBy: null,
  updatedBy: null,
  tasks: [],
  createdById: null,
  updatedById: null,
}

export const account: Account = {
  id: '1234',
  owner: user,
  ownerId: lead.owner.id,
  fullName: lead.fullName + ' Account',
  type: AccountType.NONE,
  address: lead.address,
  description: lead.description,
  phoneNum: lead.phoneNum,
  contacts: null,
  deals: null,
  tasks: [],
  createdAt: null,
  updatedAt: null,
  createdBy: null,
  updatedBy: null,
  createdById: null,
  updatedById: null,
}

export const contact: Contact = {
  ...lead,
  account: account,
  accountId: account.id,
  createdById: null,
  updatedById: null,
}

export const deal: Deal = {
  id: '1234',
  owner: user,
  ownerId: lead.owner.id,
  account: account,
  accountId: account.id,
  contact: contact,
  contactId: contact.id,
  fullName: 'deal',
  amount: 0,
  closingDate: null,
  stage: DealStage.QUALIFICATION,
  source: LeadSource.NONE,
  probability: 10,
  tasks: [],
  description: null,
  createdAt: null,
  updatedAt: null,
  createdBy: null,
  updatedBy: null,
  createdById: null,
  updatedById: null,
  notes: []
}

export const task: Task = {
  id: '1234',
  owner: user,
  ownerId: lead.owner.id,
  lead: lead,
  contact: contact,
  contactId: contact.id,
  leadId: lead.id,
  account: account,
  accountId: account.id,
  deal: deal,
  dealId: deal.id,
  priority: TaskPriority.HIGH,
  status: TaskStatus.NOT_STARTED,
  subject: 'test',
  dueDate: null,
  description: null,
  createdAt: null,
  updatedAt: null,
  createdBy: null,
  updatedBy: null,
  createdById: null,
  updatedById: null,
}
