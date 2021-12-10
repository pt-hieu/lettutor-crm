import { Account } from 'src/account/account.entity'
import { Deal, DealStage } from 'src/deal/deal.entity'
import {
  LeadContact,
  LeadSource,
  LeadStatus,
} from 'src/lead-contact/lead-contact.entity'
import { Actions } from 'src/type/action'
import { Role, User, UserStatus } from 'src/user/user.entity'

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
  leadContacts: [],
  roles: [role],
  accounts: [],
  deals: [],
}

export const lead: LeadContact = {
  id: '1234',
  owner: user,
  ownerId: user.id,
  account: null,
  accountId: null,
  isLead: true,
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
}

export const account: Account = {
  id: '1234',
  owner: user,
  ownerId: lead.owner.id,
  name: lead.fullName + ' Account',
  address: lead.address,
  description: lead.description,
  phoneNum: lead.phoneNum,
  contacts: null,
  deals: null,
  createdAt: null,
  updatedAt: null,
}

export const contact: LeadContact = {
  ...lead,
  account: account,
  accountId: account.id,
  isLead: false,
}

export const deal: Deal = {
  id: '1234',
  owner: user,
  ownerId: lead.owner.id,
  account: account,
  accountId: account.id,
  contact: contact,
  contactId: contact.id,
  name: 'deal',
  amount: 0,
  closingDate: null,
  stage: DealStage.AUTHENTICATION,
  source: LeadSource.NONE,
  probability: 10,
  description: null,
  createdAt: null,
  updatedAt: null,
}
