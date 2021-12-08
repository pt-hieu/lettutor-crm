import {
  LeadContact,
  LeadSource,
  LeadStatus,
} from 'src/lead-contact/lead-contact.entity'
import { User, UserStatus } from 'src/user/user.entity'

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
  roles: []
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
